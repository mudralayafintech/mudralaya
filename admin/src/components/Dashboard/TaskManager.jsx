import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Create Task State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        reward_free: '',
        reward_premium: '', // Equivalent to reward_member
        reward_min: '',
        reward_max: '',
        reward_info: '',
        type: 'Daily Task',
        video_link: '', // Equivalent to video_url
        pdf_url: '',
        action_link: '',
        icon_type: 'group',
        target_audience: [],
        steps: '',
        reward_member: '' // For compatibility
    });

    // Task Progress State
    const [selectedTask, setSelectedTask] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return;

        try {
            const { data: res, error } = await supabase.functions.invoke('admin-api', {
                body: { action: 'get-tasks' },
                headers: { 'x-admin-password': adminToken }
            });
            if (error) throw error;
            setTasks(res || []);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const adminToken = localStorage.getItem('adminToken');
        try {
            const { error } = await supabase.functions.invoke('admin-api', {
                body: { action: 'create-task', data: newTask },
                headers: { 'x-admin-password': adminToken }
            });
            if (error) throw error;

            alert('Task Created Successfully');
            setShowCreateForm(false);
            setNewTask({
                title: '',
                description: '',
                reward_free: '',
                reward_premium: '',
                reward_min: '',
                reward_max: '',
                reward_info: '',
                type: 'Daily Task',
                video_link: '',
                pdf_url: '',
                action_link: '',
                icon_type: 'group',
                target_audience: [],
                steps: '',
                reward_member: ''
            });
            fetchTasks();
        } catch (err) {
            alert('Failed to create task: ' + err.message);
        }
    };

    const handleViewProgress = async (task) => {
        setSelectedTask(task);
        setParticipants([]);
        setLoadingParticipants(true);
        const adminToken = localStorage.getItem('adminToken');

        try {
            const { data: res, error } = await supabase.functions.invoke('admin-api', {
                body: { action: 'get-task-participants', data: { taskId: task.id || task._id } },
                headers: { 'x-admin-password': adminToken }
            });
            if (error) throw error;
            setParticipants(res || []);
        } catch (err) {
            console.error('Failed to fetch participants', err);
        } finally {
            setLoadingParticipants(false);
        }
    };

    return (
        <div className="task-manager">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Task Manager</h4>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : '+ Create New Task'}
                </button>
            </div>

            {showCreateForm && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">Create New Task</h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreateTask}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small">Task Title</label>
                                    <input
                                        type="text" className="form-control" required
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Free Reward (₹)</label>
                                    {newTask.type === 'Dedicated Task' ? (
                                        <>
                                            <div className="col-md-3">
                                                <label className="form-label small">Base Reward (₹)</label>
                                                <input
                                                    type="number" className="form-control" required
                                                    value={newTask.reward_free}
                                                    onChange={e => setNewTask({ ...newTask, reward_free: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small">Reward Info</label>
                                                <textarea
                                                    className="form-control" rows="1"
                                                    placeholder="e.g. Varies based on..."
                                                    value={newTask.reward_info}
                                                    onChange={e => setNewTask({ ...newTask, reward_info: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-md-3">
                                                <label className="form-label small">Reward Free (₹)</label>
                                                <input
                                                    type="number" className="form-control" required
                                                    value={newTask.reward_free}
                                                    onChange={e => setNewTask({ ...newTask, reward_free: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small">Reward Premium (₹)</label>
                                                <input
                                                    type="number" className="form-control" required
                                                    value={newTask.reward_premium}
                                                    onChange={e => setNewTask({ ...newTask, reward_premium: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small">Video Link</label>
                                    <input
                                        type="text" className="form-control"
                                        placeholder="YouTube Video Link"
                                        value={newTask.video_link}
                                        onChange={e => setNewTask({ ...newTask, video_link: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Member Reward (₹)</label>
                                    <input
                                        type="number" className="form-control"
                                        value={newTask.reward_member}
                                        onChange={e => setNewTask({ ...newTask, reward_member: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <div className="col-md-6">
                                        <label className="form-label small">Type</label>
                                        <select
                                            className="form-select"
                                            value={newTask.type}
                                            onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                                        >
                                            <option>Daily Task</option>
                                            <option>Weekly Task</option>
                                            <option>One-time</option>
                                            <option>Dedicated Task</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12 mt-3">
                                        <label className="form-label small">Target Audience</label>
                                        <div className="d-flex flex-wrap gap-3">
                                            {['Student', 'House Wife', 'Working Professional', 'Part Time'].map(audience => (
                                                <div className="form-check" key={audience}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`aud-${audience}`}
                                                        checked={newTask.target_audience?.includes(audience)}
                                                        onChange={(e) => {
                                                            const current = newTask.target_audience || [];
                                                            if (e.target.checked) {
                                                                setNewTask({ ...newTask, target_audience: [...current, audience] });
                                                            } else {
                                                                setNewTask({ ...newTask, target_audience: current.filter(a => a !== audience) });
                                                            }
                                                        }}
                                                    />
                                                    <label className="form-check-label" htmlFor={`aud-${audience}`}>{audience}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small">Icon Type</label>
                                        <select
                                            className="form-select"
                                            value={newTask.icon_type}
                                            onChange={e => setNewTask({ ...newTask, icon_type: e.target.value })}
                                        >
                                            <option value="group">Group (Users)</option>
                                            <option value="rocket">Rocket</option>
                                            <option value="feedback">Feedback/Form</option>
                                            <option value="building">Bank/Building</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small">Action Link</label>
                                        <input
                                            type="text" className="form-control"
                                            value={newTask.action_link}
                                            onChange={e => setNewTask({ ...newTask, action_link: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small">Video URL</label>
                                        <input
                                            type="text" className="form-control"
                                            value={newTask.video_url}
                                            onChange={e => setNewTask({ ...newTask, video_url: e.target.value })}
                                            placeholder="Link to video"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small">PDF URL</label>
                                        <input
                                            type="text" className="form-control"
                                            value={newTask.pdf_url}
                                            onChange={e => setNewTask({ ...newTask, pdf_url: e.target.value })}
                                            placeholder="Link to PDF"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small">Steps to Complete</label>
                                        <textarea
                                            className="form-control" rows="3"
                                            placeholder="Step 1: ... &#10;Step 2: ..."
                                            value={newTask.steps}
                                            onChange={e => setNewTask({ ...newTask, steps: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small">Description (Optional)</label>
                                        <textarea
                                            className="form-control" rows="2"
                                            value={newTask.description}
                                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="col-12 text-end">
                                        <button type="submit" className="btn btn-success text-white">Save Task</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">All Tasks</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0">Title</th>
                                        <th className="border-0">Reward</th>
                                        <th className="border-0">Type</th>
                                        <th className="border-0">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-3">Loading...</td></tr>
                                    ) : tasks.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-3">No tasks found</td></tr>
                                    ) : (
                                        tasks.map(task => (
                                            <tr key={task.id || task._id}>
                                                <td>{task.title}</td>
                                                <td className="text-success fw-bold">
                                                    ₹{task.reward_free || task.reward}
                                                    {task.reward_info && (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip id={`tooltip-${task.id}`}>{task.reward_info}</Tooltip>}
                                                        >
                                                            <i className="fas fa-info-circle ms-2 text-muted" style={{ cursor: 'pointer' }}></i>
                                                        </OverlayTrigger>
                                                    )}
                                                </td>
                                                <td><span className="badge bg-secondary">{task.category || task.type}</span></td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleViewProgress(task)}
                                                    >
                                                        View Progress
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="card-header bg-primary text-white">
                            <h6 className="mb-0 text-white">
                                {selectedTask ? `Progress: ${selectedTask.title}` : 'Task Progress'}
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            {!selectedTask ? (
                                <div className="p-4 text-center text-muted small">
                                    <i className="fas fa-chart-bar fs-1 mb-2"></i>
                                    <p>Select a task to view participant progress.</p>
                                </div>
                            ) : loadingParticipants ? (
                                <div className="p-4 text-center text-muted">Loading participants...</div>
                            ) : participants.length === 0 ? (
                                <div className="p-4 text-center text-muted small">No participants yet.</div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {participants.map((p, idx) => (
                                        <li key={idx} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold small">{p.users?.full_name || 'Unknown User'}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {p.users?.email_id} <br />
                                                        {p.users?.mobile_number && <span>{p.users.mobile_number}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge bg-${p.status === 'completed' ? 'success' : 'warning'} mb-1`}>
                                                        {p.status}
                                                    </span>
                                                    {p.reward_earned > 0 && (
                                                        <div className="text-success fw-bold small">₹{p.reward_earned}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskManager;
