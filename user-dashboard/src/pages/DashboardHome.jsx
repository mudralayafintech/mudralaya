import React, { useEffect, useState } from 'react';
import { MdPlayArrow, MdTrendingUp, MdAccountBalanceWallet, MdGroup, MdContentCopy, MdRocketLaunch, MdOutlineFeedback } from 'react-icons/md';
import { FaHandHoldingUsd } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import './DashboardHome.css';



const DashboardHome = () => {
    const { profile, user } = useUser();
    const [data, setData] = useState({ tasks: [], ongoingTask: null, stats: { approved: 0, pending: 0, total: 0 }, transactions: [] });
    const [loading, setLoading] = useState(true);

    const fullName = profile?.full_name || 'User';

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            const [tasksRes, transactionsRes, statsRes, userTasksRes] = await Promise.all([
                supabase.from('tasks').select('*').limit(5),
                supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase.rpc('get_user_wallet_stats', { user_id_param: user.id }),
                supabase
                    .from('user_tasks')
                    .select('*, tasks(*)')
                    .eq('user_id', user.id)
                    .eq('status', 'ongoing')
                    .order('created_at', { ascending: false })
                    .limit(1)
            ]);

            const tasks = tasksRes.data || [];
            const transactions = transactionsRes.data || [];
            const stats = statsRes.data || { approved: 0, pending: 0, total: 0, payout: 0, today: 0, monthly: 0 };
            const ongoingTask = userTasksRes.data && userTasksRes.data.length > 0 ? userTasksRes.data[0].tasks : null;

            setData({
                tasks,
                ongoingTask,
                transactions,
                stats
            });
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const [joiningTaskId, setJoiningTaskId] = useState(null);

    const handleStartTask = async (task) => {
        if (!user) return;
        setJoiningTaskId(task.id);
        try {
            // 1. Open Link if present
            if (task.action_link) {
                window.open(task.action_link, '_blank');
            }

            // 2. Call API to join task
            const { data: responseData, error } = await supabase.functions.invoke('dashboard-api', {
                body: { action: 'start-task', taskId: task.id }
            });

            if (error) {
                // Try to extract useful error message from the response body if possible
                let errorMessage = error.message;
                try {
                    // invoke() might wrap the response body in error.context or similar, 
                    // but often we just get the message. 
                    // Let's rely on the updated backend returning JSON with 'error' field.
                    if (error && typeof error === 'object' && 'context' in error) {
                        // Attempt to read context if it's a fetch response
                        const json = await error.context.json();
                        if (json.error) errorMessage = json.error;
                    }
                } catch (e) { /* ignore parse error */ }

                throw new Error(errorMessage);
            }

            // 3. Refresh Dashboard to show new ongoing task
            await fetchDashboardData();
            // alert('Task Started Successfully!'); // Removed to make it "easy"/seamless

        } catch (err) {
            console.error('Failed to start task:', err);
            alert(`Failed to join task: ${err.message}`);
        } finally {
            setJoiningTaskId(null);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'group': return <MdGroup />;
            case 'rocket': return <MdRocketLaunch />;
            case 'feedback': return <MdOutlineFeedback />;
            default: return <MdContentCopy />;
        }
    };

    return (
        <div className="dashboard-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div>
                    <h1 className="welcome-title">Welcome Back {fullName}</h1>
                    <p className="welcome-subtitle">Start your task to earn!</p>
                </div>
                <button className="guidance-btn">
                    <span>Earning Guidance</span>
                    <div className="play-icon-wrapper">
                        <MdPlayArrow />
                    </div>
                </button>
            </div>

            {/* Earnings Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Today's Earning</h3>
                        <span>:</span>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">₹ {data.stats?.today || 0}</div>
                        <div className="stat-icon-bg icon-money-hand">
                            <FaHandHoldingUsd />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Monthly Earning</h3>
                        <span>:</span>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">₹ {data.stats?.monthly || 0}</div>
                        <div className="stat-icon-bg icon-graph">
                            <MdTrendingUp />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Total Earning</h3>
                        <span>:</span>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">₹ {data.stats?.total || 0}</div>
                        <div className="stat-icon-bg icon-wallet">
                            <MdAccountBalanceWallet />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Ongoing Task & Tasks List */}
            <div className="dashboard-grid">
                <div className="dashboard-column">
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Ongoing Task</h3>
                            <span>:</span>
                        </div>
                        {data.ongoingTask ? (
                            <div className="ongoing-task-card">
                                <div className="task-info-row">
                                    <div className="task-icon-circle blue-gradient">
                                        {getIcon(data.ongoingTask.icon_type)}
                                    </div>
                                    <div className="task-details">
                                        <h4>{data.ongoingTask.title}</h4>
                                        <p>{data.ongoingTask.category}</p>
                                    </div>
                                    <span className="expand-icon">^</span>
                                </div>
                                <div className="task-rewards-row">
                                    <span>Task Reward</span>
                                    <div className="rewards">
                                        {(data.ongoingTask.reward_member && data.ongoingTask.reward_member > 0) ? (
                                            <>
                                                <div className="reward-item member">
                                                    <span className="badge-label member">Members</span>
                                                    <span className="amount">₹ {data.ongoingTask.reward_member}</span>
                                                </div>
                                                <div className="reward-item free">
                                                    <span className="badge-label free">Free</span>
                                                    <span className="amount">₹ {data.ongoingTask.reward_free}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="reward-item single">
                                                <span className="amount text-primary fs-4">₹ {data.ongoingTask.reward_free}</span>
                                                {data.ongoingTask.reward_info && (
                                                    <small className="text-muted d-block mt-1">{data.ongoingTask.reward_info}</small>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="task-actions-row">
                                    <button className="btn-view-details">Resume Task</button>
                                    <button className="btn-copy-code">
                                        <span>Claim Reward</span>
                                        <FaHandHoldingUsd className="ms-1" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state"><p>No ongoing tasks</p></div>
                        )}
                    </div>

                    <div className="dashboard-card full-height">
                        <div className="card-header">
                            <h3>Leaderboard</h3>
                            <span>:</span>
                        </div>
                        <div className="empty-state">
                            <p>Coming Soon</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-column">
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Tasks</h3>
                            <span>:</span>
                        </div>
                        <div className="tasks-list">
                            {data.tasks?.map((task, index) => (
                                <div key={task.id} className="task-list-item">
                                    <div className="task-item-left">
                                        <div className={`task-icon-circle ${index % 2 === 0 ? 'blue-gradient' : 'purple-gradient'}`}>
                                            {getIcon(task.icon_type)}
                                        </div>
                                        <div className="task-details">
                                            <h4>{task.title}</h4>
                                            <p>{task.category}</p>
                                        </div>
                                    </div>
                                    <div className="task-actions-right">
                                        {data.ongoingTask && data.ongoingTask.id === task.id ? (
                                            <button className="btn btn-sm btn-success" disabled>
                                                Joined
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleStartTask(task)}
                                                disabled={joiningTaskId === task.id || (data.ongoingTask && data.ongoingTask.id === task.id)}
                                            >
                                                {joiningTaskId === task.id ? 'Joining...' : 'Start'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-card full-height">
                        <div className="card-header">
                            <h3>Notifications</h3>
                            <span>:</span>
                        </div>
                        <div className="empty-state">
                            <p>No new notifications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;

