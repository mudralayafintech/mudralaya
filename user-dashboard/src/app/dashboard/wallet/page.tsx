"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  BarChart2,
  RefreshCw,
  CreditCard,
  Award,
  MoreVertical,
  Rocket,
  MessageSquare,
  Megaphone,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./wallet.module.css";
import KYCModal from "@/components/dashboard/KYCModal";

export default function Wallet() {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [walletData, setWalletData] = useState({
    transactions: [],
    stats: {
      today: 0,
      monthly: 0,
      approved: 0,
      pending: 0,
      total: 0,
      payout: 0,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  // KYC State
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const supabase = createClient();

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      // Fetch KYC Status
      const { data: kycData } = await supabase
        .from("user_kyc")
        .select("status")
        .eq("user_id", session.user.id)
        .single();

      if (kycData) {
        setKycStatus(kycData.status);
      }

      // Fetch Bank Details
      const { data: bankData } = await supabase.functions.invoke(
        "bank-account",
        {
          method: "GET",
        }
      );

      if (bankData && Object.keys(bankData).length > 0) {
        setBankDetails(bankData);
        setFormData({
          holder_name: bankData.holder_name,
          bank_name: bankData.bank_name,
          account_number: bankData.account_number,
          ifsc_code: bankData.ifsc_code,
        });
      }

      // Fetch Wallet Summary
      const { data: summary } = await supabase.functions.invoke(
        "dashboard-api",
        {
          body: { action: "get-dashboard-summary" },
        }
      );

      if (summary) {
        setWalletData({
          transactions: summary.transactions || [],
          stats: {
            today: summary.stats?.today || 0,
            monthly: summary.stats?.monthly || 0,
            approved: summary.stats?.approved || 0,
            pending: summary.stats?.pending || 0,
            total: summary.stats?.total || 0,
            payout: summary.stats?.payout || 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async () => {
    try {
      const { error } = await supabase.functions.invoke("bank-account", {
        method: "POST",
        body: formData,
      });

      if (error) throw error;

      setBankDetails(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving bank details:", error);
      alert("Failed to save bank details. Please try again.");
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
        ifsc_code: bankDetails.ifsc_code,
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare size={20} />;
      case "rocket":
        return <Rocket size={20} />;
      case "campaign":
        return <Megaphone size={20} />;
      default:
        return <Megaphone size={20} />;
    }
  };

  if (loading)
    return (
      <div
        className={styles.loading}
        style={{ justifyContent: "flex-start", alignItems: "stretch" }}
      >
        <div className={styles.walletPage}>
          {/* Header Skeleton */}
          <header className={styles.walletHeader}>
            <div>
              <Skeleton width={200} height={32} style={{ marginBottom: 8 }} />
              <Skeleton width={300} height={16} />
            </div>
            <Skeleton width={100} height={40} borderRadius={12} />
          </header>

          <div className={styles.walletContent}>
            {/* Left Column Skeleton */}
            <div className={styles.walletLeft}>
              <div className={styles.statsTopRow}>
                <Skeleton width="48%" height={120} borderRadius={24} />
                <Skeleton width="48%" height={120} borderRadius={24} />
              </div>
              <div className={styles.metricsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    width="100%"
                    height={100}
                    borderRadius={20}
                  />
                ))}
              </div>
              <div
                className={styles.transactionsSection}
                style={{ marginTop: 30 }}
              >
                <Skeleton
                  width={180}
                  height={24}
                  style={{ marginBottom: 20 }}
                />
                <Skeleton
                  width="100%"
                  height={80}
                  borderRadius={20}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton width="100%" height={80} borderRadius={20} />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className={styles.walletRight}>
              <Skeleton
                width="100%"
                height={250}
                borderRadius={26}
                style={{ marginBottom: 24 }}
              />
              <Skeleton width="100%" height={300} borderRadius={26} />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.walletPage}>
      <header className={styles.walletHeader}>
        <div>
          <h1>Mudralaya Wallet</h1>
          <p className={styles.subtitle}>
            Track your earnings and manage your bank account for payouts
          </p>
        </div>
        {kycStatus === "verified" ? (
          <div className={styles.kycBadgeSuccess}>✓ KYC Verified</div>
        ) : kycStatus === "pending" ? (
          <div className={styles.kycBadgePending}>
            ⧗ KYC Submitted (Pending)
          </div>
        ) : kycStatus === "fail" || kycStatus === "rejected" ? (
          <button
            className={styles.kycBtnError}
            onClick={() => setIsKYCModalOpen(true)}
          >
            ⚠ KYC Failed - Retry
          </button>
        ) : (
          <button
            className={styles.kycBtn}
            onClick={() => setIsKYCModalOpen(true)}
          >
            Verify KYC
          </button>
        )}
      </header>

      <div className={styles.walletContent}>
        <div className={styles.walletLeft}>
          <div className={styles.statsTopRow}>
            <div className={styles.statCardLg}>
              <div className={`${styles.statCircle} ${styles.orange}`}>
                <ArrowUpRight />
              </div>
              <div className={styles.statInfo}>
                <span>Today's Pending Earning</span>
                <h3>₹ {walletData.stats.today}</h3>
              </div>
            </div>
            <div className={styles.statCardLg}>
              <div className={`${styles.statCircle} ${styles.purple}`}>
                <ArrowDownLeft />
              </div>
              <div className={styles.statInfo}>
                <span>This Month Earning</span>
                <h3 className={styles.green}>₹ {walletData.stats.monthly}</h3>
              </div>
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <div className={`${styles.metricIconBox} ${styles.bgGreen}`}>
                <BarChart2 />
              </div>
              <div className={styles.metricText}>
                <span>Approved Balance</span>
                <h4>₹ {walletData.stats.approved}</h4>
              </div>
            </div>
            <div className={styles.metricItem}>
              <div className={`${styles.metricIconBox} ${styles.bgOrange}`}>
                <RefreshCw />
              </div>
              <div className={styles.metricText}>
                <span>Pending task Amount</span>
                <h4>₹ {walletData.stats.pending}</h4>
              </div>
            </div>
            <div className={styles.metricItem}>
              <div className={`${styles.metricIconBox} ${styles.bgBlue}`}>
                <CreditCard />
              </div>
              <div className={styles.metricText}>
                <span>Total Balance</span>
                <h4>₹ {walletData.stats.total}</h4>
              </div>
            </div>
            <div className={styles.metricItem}>
              <div className={`${styles.metricIconBox} ${styles.bgPurple}`}>
                <Award />
              </div>
              <div className={styles.metricText}>
                <span>Total Payout</span>
                <h4>₹ {walletData.stats.payout}</h4>
              </div>
            </div>
          </div>

          <div className={styles.transactionsSection}>
            <h2>Latest Transactions</h2>
            <div className={styles.transactionList}>
              {walletData.transactions.length > 0 ? (
                walletData.transactions.map((t: any) => (
                  <div className={styles.transactionItem} key={t.id}>
                    <div className={styles.transLeft}>
                      <div
                        className={`${styles.transIcon} ${styles.transBlue}`}
                      >
                        {getIcon(t.icon_type)}
                      </div>
                      <div className={styles.transInfo}>
                        <h4>{t.title}</h4>
                        <p>{t.sub_title}</p>
                      </div>
                    </div>
                    <div className={styles.transAmount}>
                      {t.amount > 0 ? "+" : ""} ₹ {Math.abs(t.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#999",
                    margin: "20px 0",
                  }}
                >
                  No transactions found.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.walletRight}>
          <div className={styles.infoCard}>
            <div className={styles.cardHeaderRow}>
              <h3>Payouts</h3>
              <MoreVertical className={styles.menuIcon} size={20} />
            </div>
            <div className={styles.payoutDetails}>
              <div className={styles.detailRow}>
                <span>Minimum Payout</span>
                <span>₹ 500</span>
              </div>
              <div className={styles.detailRow}>
                <span>Total Amount (not eligible for Payout)</span>
                <span>
                  ₹ {walletData.stats.total - walletData.stats.approved}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>Pending Task Amount</span>
                <span>₹ {walletData.stats.pending}</span>
              </div>
            </div>
            <button
              className={styles.payoutBtn}
              disabled={walletData.stats.approved < 500}
            >
              Proceed to Payout
            </button>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeaderRow}>
              <h3>Bank Account</h3>
              {!isEditing && (
                <MoreVertical
                  className={styles.menuIcon}
                  onClick={handleEditClick}
                  size={20}
                />
              )}
            </div>

            {isEditing ? (
              <div className={styles.bankForm}>
                <div className={styles.formGroup}>
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.holder_name}
                    onChange={(e) =>
                      setFormData({ ...formData, holder_name: e.target.value })
                    }
                    placeholder="Enter name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_name: e.target.value })
                    }
                    placeholder="Enter bank name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        account_number: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) =>
                      setFormData({ ...formData, ifsc_code: e.target.value })
                    }
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    className={styles.btnCancel}
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                  <button className={styles.btnSave} onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {bankDetails ? (
                  <div className={styles.bankDetails}>
                    <div className={styles.detailRow}>
                      <span>Account Holder Name:</span>
                      <span>{bankDetails.holder_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Bank Name:</span>
                      <span>{bankDetails.bank_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Account Number:</span>
                      <span>{bankDetails.account_number}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>IFSC Code:</span>
                      <span>{bankDetails.ifsc_code}</span>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#999",
                      textAlign: "center",
                      margin: "20px 0",
                    }}
                  >
                    No bank account added yet.
                  </p>
                )}
                {!isEditing && (
                  <button
                    className={styles.addBankBtn}
                    onClick={handleEditClick}
                  >
                    {bankDetails ? "Update Bank Account" : "Add Bank Account"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      {userId && (
        <KYCModal
          isOpen={isKYCModalOpen}
          onClose={() => setIsKYCModalOpen(false)}
          userId={userId}
          onSuccess={() => {
            alert("KYC Submitted! We will review your documents shortly.");
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
}
