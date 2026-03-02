import Link from "next/link";

const headingFamily = '"Sora", "Trebuchet MS", "Segoe UI", sans-serif';
const bodyFamily = '"Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export default function PrivacyPolicyPage() {
  return (
    <main
      className="min-h-screen bg-slate-950 text-white"
      style={{ fontFamily: bodyFamily }}
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8">
        <Link href="/" className="text-sm text-slate-300 hover:text-white">
          ← Back to Safe-kid
        </Link>
        <h1
          className="mt-6 text-3xl font-semibold md:text-4xl"
          style={{ fontFamily: headingFamily }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-6 text-sm text-slate-200">
          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Overview
            </h2>
            <p>
              Safe-kid is a parental-control platform that helps parents
              understand their children&apos;s web activity. The Safe-kid
              browser extension collects visited URLs and time spent so that
              parents can review usage, set limits, and receive safety alerts.
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Data We Collect
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Parent account information (email, name, encrypted password).
              </li>
              <li>Child profiles (name, age, PIN, settings).</li>
              <li>
                Browsing activity (full URL, domain, page title when available,
                duration, timestamp).
              </li>
              <li>Safety classifications, alerts, and blocking decisions.</li>
              <li>
                Technical data needed to keep the service running (device ID or
                browser session ID).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              How We Use Data
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Provide parental dashboards, usage summaries, and time-limit
                enforcement.
              </li>
              <li>Detect and flag risky content to protect children.</li>
              <li>Improve accuracy and reliability of safety scoring.</li>
              <li>Communicate important alerts and account updates.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Sharing & Third Parties
            </h2>
            <p>
              Safe-kid does not sell personal data. We only share data with
              trusted service providers that help us deliver the service
              (hosting, database, analytics, and AI safety classification).
              These providers must protect your data and may only use it to
              support Safe-kid.
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Data Retention
            </h2>
            <p>
              We retain usage data while your account is active and delete it
              when you request account removal. Parents can delete child
              profiles or request deletion of activity history at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Security
            </h2>
            <p>
              We use industry-standard safeguards to protect your data,
              including encrypted credentials and access controls. No system is
              100% secure, but we continually improve our protections.
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Children&apos;s Privacy
            </h2>
            <p>
              Safe-kid is intended for parents or legal guardians. Parents must
              have consent to monitor their child&apos;s activity and are
              responsible for compliance with local laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: headingFamily }}
            >
              Contact
            </h2>
            <p>
              If you have questions about this policy, contact us at
              <span className="font-semibold"> ariunbatbumba@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
