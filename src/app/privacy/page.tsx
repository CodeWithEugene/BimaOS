import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction & Data Controller',
    body: [
      'BimaOS ("we", "us", "our") is committed to protecting your privacy in accordance with the Constitution of Kenya (Article 31 — right to privacy), the Data Protection Act, 2019 ("DPA"), and the Kenya Information and Communications Act where applicable.',
      'For the purposes of the DPA, BimaOS is the data controller of personal data collected through our platform, and processes personal data on behalf of licensed Partner Insurers who act as independent controllers for underwriting and claims data. This Privacy Policy explains what data we collect, why we collect it, how we use and share it, and the rights you have.',
    ],
  },
  {
    title: '2. Legal Basis for Processing',
    body: [
      'We process your personal data on the following lawful bases under Section 25–31 of the DPA: (a) your consent; (b) performance of a contract (issuing and administering your policy); (c) compliance with a legal obligation (KYC/AML and IRA reporting); and (d) our legitimate interests in preventing fraud and maintaining platform security.',
    ],
  },
  {
    title: '3. Information We Collect',
    body: [
      'Identity & KYC data: full name, Kenyan National ID number, KRA PIN, date of birth, gender, and copies of your National ID card and KRA Tax Certificate uploaded for verification.',
      'Contact data: email address, phone number, and mobile-money wallet details (e.g., M-Pesa).',
      'Policy & transaction data: products purchased, premiums paid, coverage limits, policy dates, and payout records.',
      'Claims data: claim descriptions, photographs or other media you submit, AI assessment scores, adjuster notes, and social-intelligence audit logs.',
      'Technical & usage data: device information, IP address, session logs, USSD interaction records, and app diagnostic data.',
      'Blockchain data: wallet addresses and transaction hashes relating to on-chain premium or payout activity.',
    ],
  },
  {
    title: '4. How We Collect Data',
    body: [
      'We collect data directly from you (registration forms, USSD menus, claim submissions), automatically through your use of the platform, and from third parties such as mobile-network operators, payment processors (M-Pesa, Paystack), and publicly available sources used for social-intelligence claim verification.',
    ],
  },
  {
    title: '5. How We Use Your Data',
    body: [
      'We use your data to: verify your identity (KYC/AML); assess and price risk; issue and administer policies; process and adjudicate claims; detect and prevent fraud; comply with regulatory and tax obligations; communicate with you about your account; and improve our products and AI models.',
    ],
  },
  {
    title: '6. KYC, AML & Regulatory Reporting',
    body: [
      'In compliance with the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA), the Anti-Corruption and Economic Crimes Act, and IRA regulations, we are required to identify and verify customers, monitor transactions, and report suspicious activity to the Financial Reporting Centre (FRC) and the IRA.',
    ],
  },
  {
    title: '7. Data Sharing & Disclosure',
    body: [
      'We share personal data only where necessary and lawful, with: (a) licensed Partner Insurers underwriting your policy; (b) payment service providers to process premiums and payouts; (c) our technology and cloud sub-processors under data-processing agreements; (d) the IRA, ODPC, FRC, and law-enforcement agencies where legally required; and (e) your authorized representatives.',
      'We do not sell your personal data. We do not share your National ID or KRA PIN with third parties except as required for verification or by law.',
    ],
  },
  {
    title: '8. Cross-Border & Blockchain Transfers',
    body: [
      'Where data is processed outside Kenya (for example, by cloud providers or AI model hosts), we rely on appropriate safeguards consistent with the DPA. Certain policy and payout records may be written to a public blockchain ledger; because blockchain data is immutable, such records are not subsequently deletable, though they are limited to non-sensitive identifiers and hashes.',
    ],
  },
  {
    title: '9. Data Security',
    body: [
      'We implement technical and organizational measures including encryption in transit and at rest, role-based access controls, audit logging, and secure key management. Despite these measures, no system can be guaranteed completely secure; we continually review and improve our controls.',
    ],
  },
  {
    title: '10. Data Retention',
    body: [
      'We retain personal data for as long as your account is active and for the period required by the IRA, tax, and AML laws (generally at least seven years after the end of a policy or claim). Blockchain audit records are retained indefinitely as a matter of design.',
    ],
  },
  {
    title: '11. Your Rights Under the DPA',
    body: [
      'Subject to legal and contractual limitations, you have the right to: (a) be informed of the processing; (b) access your personal data; (c) request correction or updating; (d) object to or restrict processing; (e) request erasure where we are not legally required to retain the data; (f) data portability; (g) withdraw consent; and (h) lodge a complaint with the Office of the Data Protection Commissioner (ODPC).',
      'To exercise these rights, contact our support team through the platform. We will respond within the timeframes required by the DPA. You may also contact the ODPC directly at complaints@odpc.go.ke.',
    ],
  },
  {
    title: '12. Automated Decision-Making',
    body: [
      'Claims triage, fraud scoring, and risk assessment use automated processing. Where an automated decision significantly affects you (for example, a claim denial), you may request human review and contest the outcome.',
    ],
  },
  {
    title: '13. Cookies & Similar Technologies',
    body: [
      'We use essential cookies and local storage to maintain your session and preferences. Non-essential analytics are used only with your consent where required.',
    ],
  },
  {
    title: '14. Children&apos;s Data',
    body: [
      'Our services are not directed to persons under 18. We do not knowingly collect personal data from minors except where a parent or guardian is the policyholder and the minor is the insured beneficiary, in which case we process only the minimum data required.',
    ],
  },
  {
    title: '15. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be notified through the platform. The current version is always available at this page.',
    ],
  },
  {
    title: '16. Contact',
    body: [
      'For privacy requests or questions, contact our support channels through the BimaOS platform. For independent oversight, contact the Office of the Data Protection Commissioner of Kenya: https://www.odpc.go.ke.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: 9 July 2026 · Compliant with the Kenya Data Protection Act, 2019
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            This document is provided for demonstration purposes as part of the Africa&apos;s Talking Insurtech Hackathon 2025. It is not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
