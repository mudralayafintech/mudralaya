import React, { useState, useEffect } from 'react';
import { FaUsers, FaCopy, FaSearch, FaFilter, FaSort, FaGem, FaBuilding, FaRocket, FaEdit, FaYoutube, FaFilePdf, FaChevronRight, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import './Task.css';

const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sidebar Filter States
    const [selectedProfessions, setSelectedProfessions] = useState({
        'All': true,
        'Student': false,
        'House Wife': false,
        'Working Professional': false,
        'Part Time': false
    });

    const [selectedTypes, setSelectedTypes] = useState({
        'All': true,
        'Daily': false,
        'Weekly': false,
        'Company': false,
        'Dedicated': false
    });

    const [sortOption, setSortOption] = useState('newest');
    const [activeTab, setActiveTab] = useState('All Task');
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    // Mobile Filter State
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data, error } = await supabase.functions.invoke('dashboard-api', {
                    body: { action: 'get-tasks' }
                });
                if (error) throw error;
                setTasks(data || []);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const toggleExpand = (id) => {
        setExpandedTaskId(expandedTaskId === id ? null : id);
    };

    const handleTakeTask = async (task) => {
        if (task.action_link) {
            window.open(task.action_link, '_blank');
        }

        // Track task start in backend
        try {
            const { error } = await supabase.functions.invoke('dashboard-api', {
                body: { action: 'start-task', taskId: task.id }
            });

            if (error) {
                console.error('Error starting task:', error);
            } else {
                // Optimistically update local state
                setTasks(prevTasks => prevTasks.map(t =>
                    t.id === task.id ? { ...t, status: 'ongoing' } : t
                ));
            }
        } catch (err) {
            console.error('Failed to start task:', err);
        }
    };

    const getSmartButtonLabel = (task) => {
        // Backend now returns merged status
        if (task.status === 'ongoing' || task.status === 'in_progress') return 'Resume Task';
        if (task.status === 'completed') return 'Claim Reward';
        return 'Start Task';
    };

    const handleSmartAction = (task) => {
        const label = getSmartButtonLabel(task);
        if (label === 'Resume Task') {
            console.log('Resuming', task.id);
            if (task.action_link) window.open(task.action_link, '_blank');
        } else if (label === 'Claim Reward') {
            console.log('Claiming', task.id);
            // Need implementation for claim
        } else {
            handleTakeTask(task);
        }
    };

    const handleProfessionChange = (prof) => {
        if (prof === 'All') {
            setSelectedProfessions({
                'All': true,
                'Student': false,
                'House Wife': false,
                'Working Professional': false,
                'Part Time': false
            });
        } else {
            setSelectedProfessions(prev => ({ ...prev, [prof]: !prev[prof], 'All': false }));
        }
    };

    const handleTypeChange = (type) => {
        if (type === 'All') {
            setSelectedTypes({
                'All': true,
                'Daily': false,
                'Weekly': false,
                'Company': false,
                'Dedicated': false
            });
        } else {
            setSelectedTypes(prev => ({ ...prev, [type]: !prev[type], 'All': false }));
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'group': return <FaUsers />;
            case 'rocket': return <FaRocket />;
            case 'feedback': return <FaEdit />;
            case 'building': return <FaBuilding />;
            default: return <FaUsers />;
        }
    };

    if (loading) return <div className="loading">Loading Tasks...</div>;

    // Filtering Logic
    const filteredTasks = tasks.filter(task => {
        // 1. Tab Filter
        if (activeTab === 'Completed' && task.status !== 'completed') return false;
        if (activeTab === 'Ongoing' && task.status !== 'in_progress') return false;

        // 2. Profession Filter
        const activeProfessions = Object.keys(selectedProfessions).filter(k => k !== 'All' && selectedProfessions[k]);
        const professionMatch = selectedProfessions['All'] ||
            (task.target_audience && task.target_audience.some(aud => activeProfessions.includes(aud))) ||
            (!task.target_audience);

        // 3. Type Filter
        const activeTypes = Object.keys(selectedTypes).filter(k => k !== 'All' && selectedTypes[k]);
        const typeMatch = selectedTypes['All'] ||
            activeTypes.some(t => task.category && task.category.toLowerCase().includes(t.toLowerCase()));

        return professionMatch && typeMatch;
    }).sort((a, b) => {
        if (sortOption === 'reward_high') return (b.reward_free || 0) - (a.reward_free || 0);
        if (sortOption === 'reward_low') return (a.reward_free || 0) - (b.reward_free || 0);
        // newest
        return new Date(b.created_at) - new Date(a.created_at);
    });



    return (
        <div className="task-page">
            <div className="task-search-container">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search tasks" className="task-search-input" />
            </div>

            <div className="row">
                {/* Sidebar */}
                <div className="col-lg-3 mb-4">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="btn-mobile-filter"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                        <FaFilter /> {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <div className={`filters-sidebar ${isFiltersOpen ? 'mobile-visible' : 'mobile-hidden'}`} style={{ position: 'sticky', top: '100px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0 fw-bold text-dark">Filters</h5>
                            <button
                                className="btn btn-link p-0 text-decoration-none small text-muted"
                                style={{ fontSize: '12px' }}
                                onClick={() => {
                                    // Reset logic
                                    setSelectedProfessions({ 'All': true });
                                    setSelectedTypes({ 'All': true });
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="filter-group mb-4">
                            <h6 className="filter-title">Profession</h6>
                            {Object.keys(selectedProfessions).map(prof => (
                                <div className="form-check" key={prof}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`prof-${prof}`}
                                        checked={selectedProfessions[prof]}
                                        onChange={() => handleProfessionChange(prof)}
                                    />
                                    <label className="form-check-label" htmlFor={`prof-${prof}`}>
                                        {prof}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h6 className="filter-title">Type of Task</h6>
                            {Object.keys(selectedTypes).map(type => (
                                <div className="form-check" key={type}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`type-${type}`}
                                        checked={selectedTypes[type]}
                                        onChange={() => handleTypeChange(type)}
                                    />
                                    <label className="form-check-label" htmlFor={`type-${type}`}>
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="col-lg-9">
                    <div className="task-header-controls">
                        <div className="task-tabs">
                            <button className={`task-tab ${activeTab === 'All Task' ? 'active' : ''}`} onClick={() => setActiveTab('All Task')}>All Task</button>
                            <button className={`task-tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>Completed</button>
                            <button className={`task-tab ${activeTab === 'Ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('Ongoing')}>Ongoing</button>
                        </div>
                        <div className="task-actions">
                            <select className="form-select sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <option value="newest">Sort by: Newest</option>
                                <option value="reward_high">Reward: High to Low</option>
                                <option value="reward_low">Reward: Low to High</option>
                            </select>
                        </div>
                    </div>

                    <div className="task-list">
                        {filteredTasks.map((task) => (
                            <div className="task-card" key={task.id}>
                                <div className="task-card-header" onClick={() => toggleExpand(task.id)}>
                                    <div className="task-left">
                                        <div className={`task-icon-wrapper icon-red-gradient`}>
                                            {getIcon(task.icon_type)}
                                        </div>
                                        <div className="task-info">
                                            <h3>{task.title}</h3>
                                            <div className="task-meta">
                                                <span>{task.category || task.type}</span>
                                                <div className="info-tooltip-container ms-2" onClick={(e) => e.stopPropagation()}>
                                                    <FaInfoCircle className="info-icon" style={{ fontSize: '14px', color: '#adb5bd' }} />
                                                    <span className="info-tooltip-text">{task.performance_info || "You can earn more by your performance"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="task-right">
                                        <button className={`reward-btn`}>
                                            ₹ {task.reward_free || task.reward}
                                        </button>
                                        <button className="toggle-btn">
                                            {expandedTaskId === task.id ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                                        </button>
                                    </div>
                                </div>

                                {expandedTaskId === task.id && (
                                    <div className="task-expanded pt-0">
                                        <div className="expanded-section mt-3">
                                            {(!task.category?.toLowerCase().includes('dedicated') && !task.title?.toLowerCase().includes('dedicated')) && (
                                                <div className="reward-pricing">
                                                    <div className="price-item">
                                                        <div className="badge-members"><FaGem /> Members</div>
                                                        <div className="price-value text-blue">₹ {task.reward_member || task.reward_premium || 800}</div>
                                                    </div>
                                                    <div className="price-item">
                                                        <div className="label-free">Free</div>
                                                        <div className="price-value text-green">₹ {task.reward_free || task.reward || 600}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {task.reward_info && (
                                                <p className="text-muted small mt-2"><FaGem className="me-1" />{task.reward_info}</p>
                                            )}
                                        </div>

                                        {(task.video_url || task.video_link || task.pdf_url) && (
                                            <div className="mt-3">
                                                {(task.video_url || task.video_link) && (
                                                    <div className="resource-link" onClick={() => window.open(task.video_url || task.video_link, '_blank')}>
                                                        <div style={{ width: 24 }}></div>
                                                        <span>Task Guidance Video</span>
                                                        <div className="ms-auto"><FaYoutube style={{ color: 'red', fontSize: '24px' }} /></div>
                                                    </div>
                                                )}
                                                {task.pdf_url && (
                                                    <div className="resource-link mt-2" onClick={() => window.open(task.pdf_url, '_blank')}>
                                                        <div style={{ width: 24 }}></div>
                                                        <span>Task Information</span>
                                                        <div className="ms-auto"><FaFilePdf style={{ color: '#e53935', fontSize: '24px' }} /></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <button
                                                className="btn-take-task w-100"
                                                onClick={() => handleSmartAction(task)}
                                            >
                                                {getSmartButtonLabel(task)}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Task;
