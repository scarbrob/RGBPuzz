import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-light-accent dark:text-dark-accent hover:opacity-80 transition-opacity mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-6">
          Privacy Policy
        </h1>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none space-y-6 text-light-text dark:text-dark-text">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Last Updated:</strong> March 24, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              1. Introduction
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz is a personal project created by Benjamin Scarbrough. This privacy policy explains how we handle your data when you use our color puzzle game.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              2.1 Local Data
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              RGBPuzz does not require any account or sign-in. All game data is stored <strong>locally in your browser</strong> using localStorage and sessionStorage. This includes:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Game progress (levels completed, attempts)</li>
              <li>Daily challenge progress and streaks</li>
              <li>Game statistics and performance metrics</li>
              <li>Theme preferences (dark/light mode)</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              <strong>Important:</strong> This data never leaves your browser. We do not collect, transmit, or store any personal information on our servers.
            </p>

            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2 mt-4">
              2.2 Server Communication
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              The game communicates with our API server only to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Fetch daily challenge puzzles</li>
              <li>Fetch level puzzles</li>
              <li>Validate puzzle solutions</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
              No personally identifiable information is sent with these requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>To generate and validate puzzle challenges</li>
              <li>To display your locally stored statistics</li>
              <li>To remember your theme preference</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              4. Data Storage
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              All game data is stored locally in your browser. Clearing your browser data will remove your game progress. We do not store any user data on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              5. Data Sharing
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We <strong>do not sell, trade, or share</strong> any data with third parties. The only external service involved is <strong>Azure Static Web Apps</strong> for hosting the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              6. Your Rights
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              Since all data is stored locally in your browser, you have full control:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li><strong>View</strong> your data via the Stats page</li>
              <li><strong>Delete</strong> your data by clearing your browser's localStorage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              7. Children's Privacy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz does not collect any personal data from anyone, including children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              8. Changes to This Policy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              9. Contact
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              For questions about this privacy policy, contact:
            </p>
            <p className="text-light-accent dark:text-dark-accent mt-2">
              Benjamin Scarbrough<br />
              <a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="hover:underline">
                GitHub Issues
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
