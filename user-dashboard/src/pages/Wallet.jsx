import React, { useState, useEffect } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiBarChart2, FiRefreshCw, FiCreditCard, FiAward, FiMoreVertical } from 'react-icons/fi';
import { MdOutlineFeedback, MdRocketLaunch, MdCampaign } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import './Wallet.css';

const Wallet = () => {
    const [bankDetails, setBankDetails] = useState(null);
    const [walletData, setWalletData] = useState({ transactions: [], stats: { today: 0, monthly: 0, approved: 0, pending: 0, total: 0, payout: 0 } });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch Bank Details
            const { data: bankData } = await supabase.functions.invoke('bank-account', {
                method: 'GET',
            });

            if (bankData && Object.keys(bankData).length > 0) {
                setBankDetails(bankData);
                setFormData({
                    holder_name: bankData.holder_name,
                    bank_name: bankData.bank_name,
                    account_number: bankData.account_number,
                    ifsc_code: bankData.ifsc_code
                });
            }

            // Fetch Wallet Summary
            const { data: summary } = await supabase.functions.invoke('dashboard-api', {
                body: { action: 'get-dashboard-summary' }
            });

            if (summary) {
                setWalletData({
                    transactions: summary.transactions || [],
                    stats: {
                        today: summary.stats?.today || 450,
                        monthly: summary.stats?.monthly || 250,
                        approved: summary.stats?.approved || 450,
                        pending: summary.stats?.pending || 450,
                        total: summary.stats?.total || 450,
                        payout: summary.stats?.payout || 450
                    }
                });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase.functions.invoke('bank-account', {
                method: 'POST',
                body: formData
            });

            if (error) throw error;

            setBankDetails(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving bank details:', error);
            alert('Failed to save bank details. Please try again.');
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        if (bankDetails) {
            setFormData({
                holder_name: bankDetails.holder_name,
                bank_name: bankDetails.bank_name,
                account_number: bankDetails.account_number,
                ifsc_code: bankDetails.ifsc_code
            });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'feedback': return <MdOutlineFeedback />;
            case 'rocket': return <MdRocketLaunch />;
            case 'campaign': return <MdCampaign />;
            default: return <MdCampaign />;
        }
    };

    if (loading) return <div className="loading">Loading Wallet...</div>;

    return (
        <div className="wallet-page">
            <header className="wallet-header">
                <div>
                    <h1>Mudralaya Wallet</h1>
                    <p className="subtitle">Track your earnings and manage your bank account for payouts</p>
                </div>
                <button className="kyc-btn">Verify KYC</button>
            </header>

            <div className="wallet-content">
                <div className="wallet-left">
                    <div className="stats-top-row">
                        <div className="stat-card-lg">
                            <div className="stat-circle orange">
                                <FiArrowUpRight />
                            </div>
                            <div className="stat-info">
                                <span>Today's Pending Earning</span>
                                <h3>₹ {walletData.stats.today}</h3>
                            </div>
                        </div>
                        <div className="stat-card-lg">
                            <div className="stat-circle purple">
                                <FiArrowDownLeft />
                            </div>
                            <div className="stat-info">
                                <span>This Month Earning</span>
                                <h3 className="green">₹ {walletData.stats.monthly}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-icon-box bg-green">
                                <FiBarChart2 />
                            </div>
                            <div className="metric-text">
                                <span>Approved Balance</span>
                                <h4>₹ {walletData.stats.approved}</h4>
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon-box bg-orange">
                                <FiRefreshCw />
                            </div>
                            <div className="metric-text">
                                <span>Pending task Amount</span>
                                <h4>₹ {walletData.stats.pending}</h4>
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon-box bg-blue">
                                <FiCreditCard />
                            </div>
                            <div className="metric-text">
                                <span>Total Balance</span>
                                <h4>₹ {walletData.stats.total}</h4>
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon-box bg-purple">
                                <FiAward />
                            </div>
                            <div className="metric-text">
                                <span>Total Payout</span>
                                <h4>₹ {walletData.stats.payout}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="transactions-section">
                        <h2>Latest Transactions</h2>
                        <div className="transaction-list">
                            {walletData.transactions.length > 0 ? walletData.transactions.map((t) => (
                                <div className="transaction-item" key={t.id}>
                                    <div className="trans-left">
                                        <div className={`trans-icon trans-blue`}>
                                            {getIcon(t.icon_type)}
                                        </div>
                                        <div className="trans-info">
                                            <h4>{t.title}</h4>
                                            <p>{t.sub_title}</p>
                                        </div>
                                    </div>
                                    <div className="trans-amount">{t.amount > 0 ? '+' : ''} ₹ {Math.abs(t.amount)}</div>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>No transactions found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="wallet-right">
                    <div className="info-card">
                        <div className="card-header-row">
                            <h3>Payouts</h3>
                            <FiMoreVertical className="menu-icon" />
                        </div>
                        <div className="payout-details">
                            <div className="detail-row">
                                <span>Minimum Payout</span>
                                <span>₹ 500</span>
                            </div>
                            <div className="detail-row">
                                <span>Total Amount (not eligible for Payout)</span>
                                <span>₹ {walletData.stats.total - walletData.stats.approved}</span>
                            </div>
                            <div className="detail-row">
                                <span>Pending Task Amount</span>
                                <span>₹ {walletData.stats.pending}</span>
                            </div>
                        </div>
                        <button className="payout-btn" disabled={walletData.stats.approved < 500}>Proceed to Payout</button>
                    </div>

                    <div className="info-card">
                        <div className="card-header-row">
                            <h3>Bank Account</h3>
                            {!isEditing && <FiMoreVertical className="menu-icon" onClick={handleEditClick} />}
                        </div>

                        {isEditing ? (
                            <div className="bank-form">
                                <div className="form-group">
                                    <label>Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={formData.holder_name}
                                        onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <input
                                        type="text"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        placeholder="Enter bank name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        placeholder="Enter account number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>IFSC Code</label>
                                    <input
                                        type="text"
                                        value={formData.ifsc_code}
                                        onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                        placeholder="Enter IFSC code"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button className="btn-cancel" onClick={handleCancelClick}>Cancel</button>
                                    <button className="btn-save" onClick={handleSave}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {bankDetails ? (
                                    <div className="bank-details">
                                        <div className="detail-row">
                                            <span>Account Holder Name:</span>
                                            <span>{bankDetails.holder_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Bank Name:</span>
                                            <span>{bankDetails.bank_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Account Number:</span>
                                            <span>{bankDetails.account_number}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>IFSC Code:</span>
                                            <span>{bankDetails.ifsc_code}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>No bank account added yet.</p>
                                )}
                                {!isEditing && (
                                    <button className="add-bank-btn" onClick={handleEditClick}>
                                        {bankDetails ? 'Update Bank Account' : 'Add Bank Account'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;

