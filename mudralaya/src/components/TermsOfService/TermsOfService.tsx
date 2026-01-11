import React from "react";
import styles from "./TermsOfService.module.css";

const TermsOfService = () => {
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.introText}>
                        These Terms of Service (“Terms”) govern your access to and use of the
                        Mudralaya website, mobile applications, and related services
                        (collectively, the “Platform”), owned and operated by Mudralayam
                        Fintech Private Limited (“Mudralaya”, “we”, “us”, or “our”).
                    </p>
                    <p className={styles.text}>
                        By accessing, using, or registering on the Platform, you acknowledge
                        that you have read, understood, and agree to be legally bound by
                        these Terms, along with our Privacy Policy, Earnings & Task Policy,
                        and any other policy notified on the Platform from time to time.
                    </p>
                    <p className={styles.text} style={{ fontWeight: 600 }}>
                        If you do not agree, you must not use the Platform.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>1.</span> Definition & Scope
                    </h2>
                    <div className={styles.text}>
                        For the purpose of these Terms:
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Users / Partners / Taskers / Associates:</strong>{" "}
                                Individuals who register on the Platform to access tasks,
                                commissions, or financial earning opportunities.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Tasks:</strong> Digital or operational tasks listed on
                                the Platform for earning rewards, incentives, or commissions.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Services:</strong> Includes task posting, task
                                performance tracking, commissions, referrals, dashboards,
                                training modules, financial tools, communications, and other
                                earning-related services.
                            </li>
                            <li className={styles.listItem}>
                                <strong>Client / Business Partner:</strong> An organization,
                                brand, agency, or enterprise that lists tasks or engages
                                Mudralaya for campaigns, outreach, insurance, college
                                admissions, finance, or related services.
                            </li>
                        </ul>
                        <p className={styles.text}>
                            Mudralaya is a platform facilitator and does not directly employ
                            users.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>2.</span> Eligibility
                    </h2>
                    <div className={styles.text}>
                        To use the Platform:
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                You must be 18 years or older, mentally competent, and legally
                                capable of forming a binding contract under Indian law.
                            </li>
                            <li className={styles.listItem}>
                                You must use the Platform for lawful purposes only.
                            </li>
                            <li className={styles.listItem}>
                                You must not be restricted by any applicable sanctions, legal
                                orders, or trade compliance rules.
                            </li>
                        </ul>
                        <p className={styles.text}>
                            Mudralaya may refuse or restrict access to any user at its sole
                            discretion, without obligation to provide reasons.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>3.</span> Account Registration
                        & Security
                    </h2>
                    <div className={styles.text}>
                        By creating an account:
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                You agree to provide accurate, truthful, and updated personal
                                information.
                            </li>
                            <li className={styles.listItem}>
                                You are solely responsible for maintaining confidentiality of
                                your login credentials.
                            </li>
                            <li className={styles.listItem}>
                                All activity through your account and device shall be considered
                                authorized by you.
                            </li>
                        </ul>
                        <p className={styles.text}>
                            Mudralaya shall not be liable for any loss, damage, or
                            unauthorized usage due to your negligence in protecting login
                            details. Mudralaya may request additional verification documents
                            to comply with regulatory requirements, fraud prevention, or KYC
                            norms.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>4.</span> Nature of Platform
                        & Relationship Disclaimer
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            Mudralaya is not an employer. Users are independent individuals
                            performing tasks voluntarily. Accordingly:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                No employer–employee relationship exists.
                            </li>
                            <li className={styles.listItem}>
                                No guaranteed income, job, internship, placement, or employment
                                is promised.
                            </li>
                            <li className={styles.listItem}>
                                Users do not represent Mudralaya without written authorization.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya does not issue employment letters unless explicitly
                                agreed in writing.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya facilitates opportunities, but does not control how,
                                when, or if a user performs a task, nor guarantees task
                                availability.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>5.</span> Tasks, Commissions
                        & Earnings
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>Users may participate in:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Digital promotion tasks</li>
                            <li className={styles.listItem}>Outreach and calling tasks</li>
                            <li className={styles.listItem}>
                                Commission-based engagements (e.g., insurance, admissions,
                                fintech services)
                            </li>
                            <li className={styles.listItem}>Referral-based earnings</li>
                            <li className={styles.listItem}>Survey or micro-task activities</li>
                            <li className={styles.listItem}>Other listed paid engagements</li>
                        </ul>
                        <p className={styles.subTitle}>By participating, you agree that:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                Task availability is not guaranteed and may vary.
                            </li>
                            <li className={styles.listItem}>
                                Completion does not guarantee acceptance—tasks are subject to
                                review.
                            </li>
                            <li className={styles.listItem}>
                                Earnings depend on successful verification and compliance with
                                task instructions.
                            </li>
                            <li className={styles.listItem}>
                                Fraudulent submissions (fake screenshots, bot traffic, fake
                                leads, duplicate actions, etc.) will result in zero payout and
                                account action.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya may modify, suspend, or terminate tasks without prior
                                notice.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>6.</span> Payments, Wallets &
                        Withdrawals
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            If the Platform provides a wallet or earnings balance:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                Amounts reflect pending, approved, or rejected earnings based on
                                task verification.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya may set minimum withdrawal limits.
                            </li>
                            <li className={styles.listItem}>
                                Withdrawals may require KYC verification.
                            </li>
                            <li className={styles.listItem}>
                                Processing time may vary based on banking and internal checks.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya may charge transaction fees, gateway charges, or
                                processing fees, if applicable.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya is not liable for banking delays, UPI failures,
                                chargebacks, or gateway issues.
                            </li>
                            <li className={styles.listItem}>
                                Payments are final once processed unless required by law.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>7.</span> Fees and Charges
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            Currently, Mudralaya does not require any mandatory joining fee
                            from users to access earning opportunities. However, Mudralaya may
                            provide optional paid services, including but not limited to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Training modules</li>
                            <li className={styles.listItem}>Certifications</li>
                            <li className={styles.listItem}>Marketing tools</li>
                            <li className={styles.listItem}>Personal branding tools</li>
                            <li className={styles.listItem}>Lead generation support</li>
                            <li className={styles.listItem}>Premium dashboards</li>
                            <li className={styles.listItem}>Software access</li>
                        </ul>
                        <p className={styles.text}>
                            Any applicable fees will be displayed clearly on the Platform. All
                            fees are non-refundable, unless mandated by law.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>8.</span> Communication &
                        Consent
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            By using the Platform, you consent to receive:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>SMS</li>
                            <li className={styles.listItem}>Email</li>
                            <li className={styles.listItem}>WhatsApp messages</li>
                            <li className={styles.listItem}>In-app notifications</li>
                            <li className={styles.listItem}>Phone calls</li>
                        </ul>
                        <p className={styles.subTitle}>
                            These communications may include:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Task updates</li>
                            <li className={styles.listItem}>Payments or reminders</li>
                            <li className={styles.listItem}>Promotional content</li>
                            <li className={styles.listItem}>Legal or policy changes</li>
                            <li className={styles.listItem}>Verification or security alerts</li>
                        </ul>
                        <p className={styles.text}>
                            Users may opt-out of marketing communication, but cannot opt-out
                            of essential operational communication.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>9.</span> User Conduct &
                        Prohibited Activities
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>Users agree not to:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                Post or engage in fraudulent or misleading submissions
                            </li>
                            <li className={styles.listItem}>
                                Circumvent tracking, validation, or payment mechanisms
                            </li>
                            <li className={styles.listItem}>
                                Impersonate others or create duplicate accounts
                            </li>
                            <li className={styles.listItem}>
                                Access or use data of other users without permission
                            </li>
                            <li className={styles.listItem}>
                                Post offensive, defamatory, obscene, communal, or unlawful
                                content
                            </li>
                            <li className={styles.listItem}>
                                Disrupt platform functionality through hacking, automation, or
                                scraping
                            </li>
                            <li className={styles.listItem}>
                                Attempt to commercially exploit the Platform without
                                authorization
                            </li>
                        </ul>
                        <p className={styles.subTitle}>Violation may result in account:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Suspension</li>
                            <li className={styles.listItem}>Permanent ban</li>
                            <li className={styles.listItem}>Earnings forfeiture</li>
                            <li className={styles.listItem}>Legal action where applicable</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>10.</span> Data Usage &
                        Privacy
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            Mudralaya may collect and process personal and behavioural data
                            for:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Platform functionality</li>
                            <li className={styles.listItem}>Fraud prevention</li>
                            <li className={styles.listItem}>Regulatory compliance</li>
                            <li className={styles.listItem}>Communication purposes</li>
                            <li className={styles.listItem}>Analytics and improvements</li>
                        </ul>
                        <p className={styles.text}>
                            Data usage is governed by the Privacy Policy, compliant with
                            applicable Indian data laws. Mudralaya may share data with service
                            providers (payment gateways, SMS, email) and regulatory
                            authorities upon legal requests.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>11.</span> Intellectual
                        Property
                    </h2>
                    <div className={styles.text}>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                All trademarks, logos, platform designs, content, and software
                                belong to Mudralaya.
                            </li>
                            <li className={styles.listItem}>
                                Users may not copy, distribute, modify, or resell content
                                without written consent.
                            </li>
                            <li className={styles.listItem}>
                                User-submitted content grants Mudralaya a non-exclusive,
                                worldwide license for platform usage, promotion, analytics, and
                                legal compliance.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>12.</span> Platform
                        Modifications
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            Mudralaya may modify, suspend, or discontinue:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Features</li>
                            <li className={styles.listItem}>Functionality</li>
                            <li className={styles.listItem}>Tasks</li>
                            <li className={styles.listItem}>Earnings structures</li>
                            <li className={styles.listItem}>Access levels</li>
                            <li className={styles.listItem}>Fees</li>
                            <li className={styles.listItem}>APIs</li>
                        </ul>
                        <p className={styles.text}>
                            Without prior notice. Continued use constitutes acceptance.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>13.</span> Liability &
                        Disclaimer
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>You understand and agree that:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                Mudralaya does not guarantee income or job placements.
                            </li>
                            <li className={styles.listItem}>
                                Earnings vary based on successful performance and verification.
                            </li>
                            <li className={styles.listItem}>
                                Mudralaya is not responsible for losses arising from task
                                rejections, banking delays, platform downtime, internet failure,
                                third-party services, user negligence, or Force Majeure events.
                            </li>
                        </ul>
                        <p className={styles.text}>
                            To the maximum extent permitted by law, Mudralaya’s liability
                            shall not exceed the total fees paid by the user in the last 3
                            months, if any. Indirect, incidental, or consequential damages are
                            disclaimed entirely.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>14.</span> Account Suspension
                        & Termination
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            Mudralaya may suspend or terminate accounts for:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Fraud or suspicious activity</li>
                            <li className={styles.listItem}>Repeated task violations</li>
                            <li className={styles.listItem}>
                                Abuse, harassment, or offensive conduct
                            </li>
                            <li className={styles.listItem}>
                                Misuse of platform communications
                            </li>
                            <li className={styles.listItem}>
                                Violations of laws or these Terms
                            </li>
                            <li className={styles.listItem}>
                                Security threats or chargebacks
                            </li>
                        </ul>
                        <p className={styles.subTitle}>Termination may result in:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Loss of access</li>
                            <li className={styles.listItem}>Forfeiture of pending earnings</li>
                            <li className={styles.listItem}>Legal action where applicable</li>
                        </ul>
                        <p className={styles.text}>
                            Users may request voluntary account deletion via support.
                        </p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>15.</span> Dispute Resolution
                        & Governing Law
                    </h2>
                    <div className={styles.text}>
                        <p className={styles.text}>
                            These Terms are governed by the laws of India. In case of
                            disputes:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                Parties shall attempt resolution amicably.
                            </li>
                            <li className={styles.listItem}>
                                If unresolved, disputes shall be referred to binding arbitration
                                in Patna, Bihar, India, under the Arbitration and Conciliation
                                Act, 1996.
                            </li>
                            <li className={styles.listItem}>
                                The arbitration shall be conducted in English.
                            </li>
                            <li className={styles.listItem}>
                                Courts in Patna, Bihar shall have exclusive jurisdiction.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>16.</span> Grievance
                        Redressal
                    </h2>
                    <div className={styles.text}>
                        For complaints, escalation, or rights exercise:
                        <div className={styles.contactInfo}>
                            <p>Email: [Insert Official Support Email]</p>
                            <p>
                                Response Time: Within timelines prescribed under applicable laws
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>17.</span> Changes to Terms
                    </h2>
                    <div className={styles.text}>
                        Mudralaya reserves the right to update these Terms at any time.
                        Updates become effective upon posting on the Platform. Continued use
                        implies acceptance.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
