import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <div className="py-4 sm:py-8">
        <Link
          to="/"
          className="game-button-secondary text-sm mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          Privacy Policy
        </h1>

        {/* Honest disclaimer - not a legal shield, just transparency */}
        <div className="glass-card p-4 sm:p-5 mb-6 border-l-4 border-yellow-500/70 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Heads up:</strong> This policy was written by the project's
            developer, not by an attorney. It aims to be plain-language and
            accurate, but it is not legal advice. If you have legal questions
            about your data, please consult a qualified lawyer in your jurisdiction.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 md:p-10 space-y-6 text-light-text-primary dark:text-dark-text-primary">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Last Updated:</strong> April 30, 2026
          </p>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              1. Introduction
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz ("we", "our", or "us") operates rgbpuzz.com (the "Service").
              This policy explains what limited data we handle when you play.
              Short version: <strong>no accounts, no tracking, no advertising,
              no third-party analytics.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              2. Data Stored In Your Browser
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              The Service stores game data in your browser using
              <code className="px-1 mx-1 rounded bg-black/20">localStorage</code>
              and
              <code className="px-1 mx-1 rounded bg-black/20">sessionStorage</code>.
              This storage is strictly necessary for the game to function. It
              includes:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Game progress (levels completed, attempts taken)</li>
              <li>Daily challenge progress and streaks</li>
              <li>Aggregate statistics (win rate, solve times)</li>
              <li>Theme preference (dark/light mode)</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              This data <strong>never leaves your browser</strong>. Clearing
              your browser storage permanently deletes it. We have no way to
              recover it because we never had a copy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              3. Data Sent To Our Server
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              The game makes API requests to our server (api.rgbpuzz.com) to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Fetch the daily challenge puzzle</li>
              <li>Fetch level puzzles</li>
              <li>Validate your submitted solution</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              These requests do not include your name, email, account, or any
              identifier you provided to us. However, like any web service, the
              following is automatically transmitted by your browser and visible
              to our server infrastructure:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1 mt-2">
              <li>Your <strong>IP address</strong></li>
              <li>Your <strong>User-Agent string</strong> (browser and OS)</li>
              <li>The URL of the API endpoint and request timestamp</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              IP addresses are considered personal data under the GDPR and some
              US state laws. We use this information solely to (a) operate the
              Service, (b) enforce per-IP rate limits to prevent abuse, and
              (c) diagnose errors. We do not use it for advertising, profiling,
              or sale to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              4. Server Logs &amp; Retention
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Our hosting provider (Microsoft Azure) records standard request
              logs containing the data described in Section 3. These logs are
              retained for up to <strong>90 days</strong> and then automatically
              deleted. Rate-limit counters live only in server memory and are
              discarded within minutes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              5. Third-Party Services (Sub-processors)
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              We use the following third parties to operate the Service. We do
              not share data with them beyond what is required for them to host
              the Service:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li><strong>Microsoft Azure</strong> (Static Web Apps + Azure Functions) - hosting and request handling. Data may be processed in the United States.</li>
              <li><strong>GitHub</strong> - source code hosting only; not involved in user requests.</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              We do <strong>not</strong> use Google Analytics, Facebook Pixel,
              ad networks, or any third-party tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              6. Legal Basis (GDPR / UK GDPR)
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              For users in the EU, UK, or other jurisdictions where this
              applies: our legal basis for processing the limited data
              described above is our <strong>legitimate interest</strong> in
              providing a functioning, secure, abuse-resistant Service
              (Article 6(1)(f) GDPR). Browser storage of your game data falls
              under the "strictly necessary" exemption of the ePrivacy Directive
              and does not require consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              7. Your Rights
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              Because we don't have user accounts, most data-subject rights are
              exercised directly in your browser:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li><strong>Access:</strong> Your game data is visible on the Stats page.</li>
              <li><strong>Deletion:</strong> Clear your browser's site data for rgbpuzz.com.</li>
              <li><strong>Portability:</strong> Use your browser's developer tools to export localStorage as JSON.</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              For server log data tied to your IP, contact{' '}
              <a href="mailto:legal@rgbpuzz.com" className="text-light-accent dark:text-dark-accent hover:underline">
                legal@rgbpuzz.com
              </a>{' '}
              with the approximate date and time of your activity. Note that we
              cannot reliably identify your specific entries without that
              information, and entries older than 90 days have been deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              8. Children's Privacy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              The Service is suitable for general audiences and does not
              knowingly collect personal information from children under 13
              beyond the incidental technical data (IP address, User-Agent)
              described in Section 3. The Service does not require any account,
              name, email, or other identifier. If you are a parent or guardian
              and believe your child has provided personal data, contact us and
              we will work with you to address it - though, again, we do not
              ask for or store such data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              9. Security
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              The Service is served over HTTPS. Because we store no personal
              data on our servers and require no accounts, the impact of a
              server breach would be limited to the transient request logs
              described in Section 4. We make no other security guarantees - see the Disclaimer of Warranties in our Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              10. Changes to This Policy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We may update this policy. Changes will be posted on this page
              with a new "Last Updated" date. Because we don't have your email,
              we cannot notify you directly - please check this page if the
              policy matters to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              11. Contact
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Questions about this policy:
            </p>
            <p className="text-light-accent dark:text-dark-accent mt-2">
              RGBPuzz<br />
              <a href="mailto:legal@rgbpuzz.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                legal@rgbpuzz.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
