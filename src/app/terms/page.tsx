import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Subscriber", "Policyholder", "you") and BimaOS ("we", "us", "our"), the operator of the BimaOS micro-insurance platform accessible via our website, mobile application, USSD channel (*384*11400#), and SMS short code (21565).',
      'By registering an account, purchasing a policy, filing a claim, or otherwise using our services, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the platform.',
    ],
  },
  {
    title: '2. About BimaOS',
    body: [
      'BimaOS is an open insurance infrastructure that connects subscribers with licensed insurance providers ("Partner Insurers") across Kenya and the wider African market. BimaOS is a technology and distribution platform; the insurance products offered through the platform are underwritten and issued by our Partner Insurers who are licensed and regulated by the Insurance Regulatory Authority (IRA) of Kenya under the Insurance Act (Cap. 487).',
      'Where BimaOS issues a policy on behalf of a Partner Insurer, the Partner Insurer remains the risk-bearing entity. BimaOS facilitates underwriting, premium collection, claims intake, and payout disbursement as an authorized intermediary.',
    ],
  },
  {
    title: '3. Eligibility',
    body: [
      'You must be at least 18 years of age and legally capable of entering into contracts under the laws of Kenya to register and purchase insurance through BimaOS.',
      'You must provide accurate identity information, including a valid Kenyan National ID number (or equivalent government-issued identification) and, where applicable, a KRA PIN, for Know-Your-Customer (KYC) and Anti-Money-Laundering (AML) compliance as required by the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and IRA regulations.',
      'Residents of jurisdictions where micro-insurance of this nature is prohibited are not permitted to use the service.',
    ],
  },
  {
    title: '4. Account Registration & KYC',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use.',
      'We are required by law to verify your identity before issuing a policy or processing a payout. Failure to provide truthful and complete KYC information may result in refusal of coverage, claim denial, or account suspension.',
    ],
  },
  {
    title: '5. Insurance Products & Coverage',
    body: [
      'BimaOS distributes micro-insurance and parametric products across categories including, but not limited to: Kilimo Shield (agriculture & weather-index cover), Boda & Motor Cover, Biashara Cover (micro-retail), and Afya Care (health & life). Each product is defined by its own Product Disclosure Statement (PDS) specifying covered perils, sums insured, exclusions, and waiting periods.',
      'Coverage is only active once a premium has been successfully received and a policy record has been created. Coverage limits, waiting periods, and qualifying events are product-specific and described at the point of purchase and in the PDS.',
      'Parametric products pay out automatically when a pre-defined index threshold (for example, rainfall deficiency or a verified public event) is breached, without the need to submit a loss assessment.',
    ],
  },
  {
    title: '6. Premiums & Payments',
    body: [
      'Premiums are payable via M-Pesa, Paystack, or other supported methods including, where enabled, on-chain settlement in test networks. Daily and seasonal premium schedules are displayed before purchase.',
      'A policy lapses if a recurring premium is not paid by its due date, subject to any grace period specified in the PDS. No cover is provided during a lapsed period.',
      'All premiums collected are held in accordance with IRA client-money and statutory deposit requirements through our Partner Insurers.',
    ],
  },
  {
    title: '7. Policy Issuance & Duration',
    body: [
      'Upon successful payment, a policy is issued and a unique policy identifier is generated. A cryptographic record of the issuance may be written to a public blockchain ledger for audit and dispute-resolution purposes.',
      'Policy duration, start date, and end date are defined by the selected plan. You may renew, upgrade, or cancel a policy subject to the terms of the applicable PDS.',
    ],
  },
  {
    title: '8. Claims Process',
    body: [
      'Claims may be initiated via the mobile app, web portal, USSD (*384*11400#), or SMS short code (21565). You must provide a truthful description of the event and any requested supporting media (for example, photographs of damage).',
      'Submitted claims are assessed using automated artificial-intelligence tools that score damage and detect potential fraud, and may be escalated for human review by a licensed adjuster where the system flags uncertainty or where required by the IRA.',
      'Approved claims are paid to your registered mobile-money account (e.g., M-Pesa) or, where applicable, via on-chain settlement. Payout amounts are subject to the limits and sub-limits defined in the PDS.',
    ],
  },
  {
    title: '9. Exclusions & Limitations',
    body: [
      'Standard exclusions apply, including but not limited to: losses occurring before cover commenced or after lapse; losses arising from fraudulent, intentionally misleading, or materially inaccurate information; losses excluded under the relevant PDS; and losses caused by events not covered by the purchased product.',
      'BimaOS and its Partner Insurers are not liable for indirect, consequential, or punitive damages beyond the sums insured under an active policy.',
    ],
  },
  {
    title: '10. Regulatory Compliance',
    body: [
      'All insurance activities conducted through BimaOS comply with the Insurance Act (Cap. 487), the IRA micro-insurance and intermediary regulations, the Data Protection Act (2019), and applicable anti-fraud and AML legislation of Kenya.',
      'We maintain records adequate for regulatory inspection and may disclose information to the IRA, the Office of the Data Protection Commissioner (ODPC), law-enforcement agencies, and other authorities where legally required.',
    ],
  },
  {
    title: '11. Blockchain & Audit Records',
    body: [
      'To support transparency and IRA RegTech auditing, certain policy and payout events may be recorded on a public blockchain. Blockchain records are immutable; corrections to erroneous records are handled through offsetting entries and internal ledgers rather than deletion.',
    ],
  },
  {
    title: '12. Artificial Intelligence & Automated Decisions',
    body: [
      'We use automated decision-making for claims triage, fraud detection, and risk scoring. Where an automated decision produces a legal or similarly significant effect (such as claim denial), you have the right to request human review in accordance with our Privacy Policy and applicable law.',
    ],
  },
  {
    title: '13. USSD & SMS Services',
    body: [
      'USSD and SMS services are provided on an "as available" basis and depend on your mobile network operator. Standard carrier charges may apply. BimaOS is not responsible for network outages or delays outside its control.',
    ],
  },
  {
    title: '14. Intellectual Property',
    body: [
      'All trademarks, logos, software, content, and designs on the BimaOS platform are the property of BimaOS or its licensors and are protected by applicable intellectual-property laws. No license is granted except as expressly permitted.',
    ],
  },
  {
    title: '15. Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, BimaOS shall not be liable for any loss arising from your use of, or inability to use, the platform, except to the extent such loss arises from our gross negligence or wilful misconduct. Our aggregate liability is limited to the premium paid for the relevant policy.',
    ],
  },
  {
    title: '16. Indemnification',
    body: [
      'You agree to indemnify and hold harmless BimaOS and its Partner Insurers from any claims, losses, or liabilities arising from your breach of these Terms, your provision of false information, or your fraudulent conduct.',
    ],
  },
  {
    title: '17. Suspension & Termination',
    body: [
      'We may suspend or terminate your account, withhold payouts, or report to authorities if we detect fraud, material misrepresentation, breach of these Terms, or a regulatory obligation to do so.',
    ],
  },
  {
    title: '18. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. Material changes will be communicated through the platform or via the contact details you provided. Continued use after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    title: '19. Governing Law & Dispute Resolution',
    body: [
      'These Terms are governed by the laws of the Republic of Kenya. Disputes should first be raised with our support team and may be escalated to the Insurance Regulatory Authority or the relevant consumer tribunal.',
    ],
  },
  {
    title: '20. Contact',
    body: [
      'Questions about these Terms may be directed to our support channels available through the BimaOS platform. For regulatory matters, contact the Insurance Regulatory Authority of Kenya.',
    ],
  },
];

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: 9 July 2026 · BimaOS micro-insurance platform
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
