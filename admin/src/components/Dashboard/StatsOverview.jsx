import React from 'react';

const StatsOverview = ({ data }) => {
    const stats = [
        {
            title: 'Total Revenue',
            value: `₹ ${(data?.counts?.revenue || 0).toLocaleString()}`,
            change: '+100%',
            isPositive: true,
            icon: 'fas fa-rupee-sign',
            color: 'primary'
        },
        {
            title: 'Join Requests',
            value: data?.counts?.joinRequests || 0,
            change: '',
            isPositive: true,
            icon: 'fas fa-user-plus',
            color: 'success'
        },
        {
            title: 'Advisor Apps',
            value: data?.counts?.advisorApplications || 0,
            change: '',
            isPositive: true,
            icon: 'fas fa-briefcase',
            color: 'info'
        },
        {
            title: 'Available Tasks',
            value: data?.counts?.tasks || 0,
            change: '',
            isPositive: true,
            icon: 'fas fa-tasks',
            color: 'warning'
        }
    ];

    return (
        <div className="stats-overview">
            <div className="row g-4">
                {stats.map((stat, index) => (
                    <div className="col-12 col-md-6 col-lg-3" key={index}>
                        <div className="stat-card-modern">
                            <div className="stat-card-body">
                                <div className="stat-content">
                                    <h6 className="stat-title">{stat.title}</h6>
                                    <h2 className="stat-value">{stat.value}</h2>
                                    <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                                        <i className={`fas fa-arrow-${stat.isPositive ? 'up' : 'down'}`}></i>
                                        <span>{stat.change} this week</span>
                                    </div>
                                </div>
                                <div className={`stat-icon-bg bg-gradient-${stat.color}`}>
                                    <i className={stat.icon}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsOverview;
