import React from "react";
import styles from "./PrivacyPolicy.module.css";

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.introText}>
                        This Privacy Policy describes how Mudralayam Fintech Private Limited (“Mudralaya”, “we”, “us”, “our”) collects, uses, discloses, stores, and protects personal information through our website, mobile application, and related services (collectively, the “Platform”).
                    </p>
                    <p className={styles.text}>
                        By accessing or using the Platform, you consent to this Privacy Policy.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>1.</span> Privacy Policy
                    </h2>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>1. Information We Collect</p>
                        <p className={styles.text}>We may collect the following categories of data:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}><strong>A. Personal Information:</strong> Name, Phone number, Email address, Date of birth, Gender (optional), Address (if required for payouts or verification)</li>
                            <li className={styles.listItem}><strong>B. Identity Information (for KYC / payouts):</strong> Aadhar / PAN / Voter ID (as applicable), Bank account details / UPI details</li>
                            <li className={styles.listItem}><strong>C. Usage & Technical Data:</strong> Device information, IP address, Browser type, Login logs, App usage patterns</li>
                            <li className={styles.listItem}><strong>D. Task & Transaction Data:</strong> Task submissions, Earnings history, Commission payout details, Payment confirmations</li>
                            <li className={styles.listItem}><strong>E. Communications:</strong> Emails, SMS & WhatsApp interactions, Support requests, Platform notifications</li>
                        </ul>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>2. How We Use Your Information</p>
                        <p className={styles.text}>We use the collected data for:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Platform functionality</li>
                            <li className={styles.listItem}>User authentication</li>
                            <li className={styles.listItem}>Payment processing & withdrawals</li>
                            <li className={styles.listItem}>Task assignment & verification</li>
                            <li className={styles.listItem}>Fraud prevention and security</li>
                            <li className={styles.listItem}>Customer support</li>
                            <li className={styles.listItem}>Communication (operational & marketing)</li>
                            <li className={styles.listItem}>Compliance with applicable laws</li>
                            <li className={styles.listItem}>Analytics & platform improvement</li>
                        </ul>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>3. Legal Basis for Processing</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Contractual necessity</li>
                            <li className={styles.listItem}>Legal obligation</li>
                            <li className={styles.listItem}>Legitimate business interest</li>
                            <li className={styles.listItem}>User consent (where required)</li>
                        </ul>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>4. Sharing of Information</p>
                        <p className={styles.text}>We may share data with:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Payment gateways and Cloud hosting providers</li>
                            <li className={styles.listItem}>SMS/Email/WhatsApp providers</li>
                            <li className={styles.listItem}>Verification agencies (KYC)</li>
                            <li className={styles.listItem}>Business partner platforms (only operational)</li>
                            <li className={styles.listItem}>Government authorities when legally required</li>
                        </ul>
                        <p className={styles.text}>We do not sell user data.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>5. Data Retention</p>
                        <p className={styles.text}>We retain data for as long as necessary to provide services, meet legal/regulatory requirements, resolve disputes, and maintain records. Deletion requests are permitted (subject to legal retention duties).</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>6. Cookies & Tracking</p>
                        <p className={styles.text}>The Platform may use cookies to maintain sessions, personalize experience, and run analytics. Users may disable cookies in their browser, but certain features may stop working.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>7. Data Security</p>
                        <p className={styles.text}>We implement reasonable security measures including encryption where applicable, secure storage, access role controls, and monitoring for suspicious activity. However, we do not guarantee absolute security of data transmitted online.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>8. User Rights (Indian Jurisdiction)</p>
                        <p className={styles.text}>Users may request: Access to their data, Correction of inaccurate data, Data deletion (if legally allowed), and Withdrawal of consent for marketing.</p>
                        <div className={styles.contactInfo}>
                            <p>Requests can be emailed to: [Insert Email]</p>
                        </div>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>9. Children’s Privacy</p>
                        <p className={styles.text}>The Platform is intended for users 18+. We do not knowingly collect data from minors.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>10. Changes to Policy</p>
                        <p className={styles.text}>We may update this policy periodically. Continued use indicates acceptance of updates.</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>2.</span> Refund & Cancellation Policy
                    </h2>
                    <p className={styles.lastUpdated}>Last Updated: [Insert Date]</p>
                    <p className={styles.text}>This policy governs refunds for payments made on the Mudralaya Platform.</p>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>1. Scope</p>
                        <p className={styles.text}>This applies to optional paid services (training, tools, premium features) and value-added services related to platform usage. It does not apply to user earnings from tasks or commissions.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>2. Cancellation of Paid Services</p>
                        <p className={styles.text}>Users may request cancellation only before service activation. Once activated, digital services are non-refundable.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>3. Refund Eligibility</p>
                        <p className={styles.text}>Refunds may be granted only when: A paid service fails to activate due to a Mudralaya error, Duplicate payments are made, or A legally valid chargeback request is received.</p>
                        <p className={styles.text}>Refund will not be issued for: Change of mind, Lack of usage, Incomplete tasks by the user, or Commission or earnings disputes.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>4. Payment Failures</p>
                        <p className={styles.text}>If payment fails but amount is deducted: User must contact support with proof. Refund is processed via payment gateway timelines (up to 7–14 business days depending on bank).</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>5. No Refund on Earnings</p>
                        <p className={styles.text}>Earnings from tasks are not refundable. Verification failures or rejections do not qualify for refund claims.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>6. Contact for Refunds</p>
                        <div className={styles.contactInfo}>
                            <p>Email: [Insert Support Email]</p>
                            <p>Support Time: Mon–Sat, 10 AM – 7 PM</p>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>3.</span> Anti-Fraud & KYC Policy
                    </h2>
                    <p className={styles.lastUpdated}>Last Updated: [Insert Date]</p>
                    <p className={styles.text}>Mudralaya enforces strict controls to prevent fraud, misuse, and illegal activities.</p>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>1. KYC Verification</p>
                        <p className={styles.text}>Mudralaya may require mandatory KYC for withdrawals, high-value commissions, insurance-related sales, and regulatory compliance. Acceptable documents may include Aadhar, PAN, Voter ID, or Driving License.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>2. Fraudulent Activities (Examples)</p>
                        <p className={styles.text}>Following are treated as fraud: Fake task submissions, Fake screenshots or proof, Automated/scripted actions, Misuse of referral codes, Impersonation, False identity submission, Abuse of promotional credits, Chargeback misuse, Bank or UPI fraud.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>3. Consequences of Fraud</p>
                        <p className={styles.text}>Mudralaya may take actions including: Task rejection, Earnings forfeiture, Account suspension or permanent ban, Legal reporting to authorities, Civil or criminal action where applicable.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>4. AML & CFT Compliance</p>
                        <p className={styles.text}>Users must not use the Platform for Money laundering, Terror funding, Illegal product promotions, or Unlawful financial transactions.</p>
                    </div>

                    <div className={styles.subSection}>
                        <p className={styles.subTitle}>5. Reporting Suspicion</p>
                        <div className={styles.contactInfo}>
                            <p>Users can report fraud at: [Insert Email]</p>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>4.</span> Community Guidelines
                    </h2>
                    <p className={styles.text}>To maintain a healthy ecosystem, users must: Be respectful in communication, Avoid hate speech, harassment, or abuse, Follow platform instructions, Avoid spamming or unsolicited messages, Maintain professionalism with clients & team members.</p>
                    <p className={styles.text}>Prohibited community behaviors include: Threats, bullying, harassment, Sexual or offensive content, Religious, caste-based or political hate speech, Promotion of illegal products or services. Violation may result in suspensions.</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>5.</span> Task Verification Policy
                    </h2>
                    <p className={styles.text}>Users understand that tasks undergo manual or automated verification, which may take 24–180 hours depending on task type.</p>
                    <p className={styles.text}>Rejections may occur for: Failure to follow instructions, Fake submissions, Incomplete actions, Invalid or unverifiable proof, Duplicate or bot-generated results. Decisions made by Mudralaya’s verification team are final.</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>6.</span> Client / Brand Agreement (For Companies Posting Tasks)
                    </h2>
                    <ul className={styles.list}>
                        <li className={styles.listItem}><strong>Companies posting tasks agree that:</strong> All task descriptions must be accurate and lawful; No illegal, adult, discriminatory, or harmful tasks shall be posted; Payment obligations must be honored within agreed timelines; Data provided by users may only be used for stated task purposes; Companies cannot misuse user information for marketing without consent.</li>
                        <li className={styles.listItem}>Mudralaya may decline or remove tasks that violate guidelines.</li>
                        <li className={styles.listItem}><strong>Companies are responsible for:</strong> Compliance with applicable Indian laws, Ensuring no misleading or exploitative tasks, Avoiding unpaid labor disguised as “tests”.</li>
                        <li className={styles.listItem}><strong>Mudralaya reserves the right to:</strong> Reject campaigns, Withhold services, Terminate partnerships, Take legal action in case of breach.</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>7.</span> User Earnings Disclaimer
                    </h2>
                    <p className={styles.text}>Mudralaya does not guarantee jobs, salaries, internships, or minimum income.</p>
                    <p className={styles.text}>Earnings depend on task availability, user performance, quality and compliance, verification success, and market demand. Users must not rely on the Platform as their sole source of income.</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionNumber}>8.</span> Data Processing & Sharing Policy
                    </h2>
                    <p className={styles.text}>Mudralaya may process data for identity verification, task assignment, lead validation, and analytics and service improvements.</p>
                    <p className={styles.text}>Data may be shared with banks/payment processors, KYC agencies, SMS/email service providers, and business partners (only operational purposes).</p>
                    <p className={styles.text}>Data will not be sold or used for consumer profiling unrelated to operations. Users may request data deletion subject to legal constraints.</p>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
