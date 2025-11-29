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
            <strong>Last Updated:</strong> November 28, 2025
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
              2.1 Authentication Data
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              We use <strong>Azure Active Directory B2C OAuth</strong> for authentication. When you sign in:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>We receive a <strong>unique user ID</strong> (random identifier) from Azure B2C</li>
              <li>We <strong>DO NOT</strong> receive your email address</li>
              <li>We <strong>DO NOT</strong> receive your real name</li>
              <li>We <strong>DO NOT</strong> receive any personal information</li>
              <li>The display name shown is your <strong>Azure B2C account name</strong>, which you control</li>
            </ul>

            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2 mt-4">
              2.2 Game Data
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              We store the following game-related data linked to your unique ID:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Game progress (levels completed, attempts, solve times)</li>
              <li>Daily challenge progress and streaks</li>
              <li>Board states (current puzzle configurations)</li>
              <li>Game statistics and performance metrics</li>
            </ul>

            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2 mt-4">
              2.3 Technical Data
            </h3>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Browser local storage for theme preferences and game state</li>
              <li>Azure Application Insights for error logging and performance monitoring</li>
              <li>No cookies are used for tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>To save your game progress across devices</li>
              <li>To calculate and display your statistics</li>
              <li>To provide daily challenges and track streaks</li>
              <li>To monitor and improve game performance</li>
              <li>To fix bugs and technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              4. Data Storage
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Your game data is stored in <strong>Azure Table Storage</strong> in the United States. All data is associated only with your anonymous user ID—never with personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              5. Data Sharing
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We <strong>do not sell, trade, or share</strong> your data with third parties. The only external service we use is:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li><strong>Microsoft Azure B2C</strong> for authentication (they handle OAuth securely)</li>
              <li><strong>Azure Application Insights</strong> for error monitoring (Microsoft-hosted)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              6. Your Rights
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li><strong>Access</strong> your data (view your stats in the game)</li>
              <li><strong>Delete</strong> your account and all associated data (<a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="text-light-accent dark:text-dark-accent hover:underline">file an issue</a>)</li>
              <li><strong>Export</strong> your data (<a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="text-light-accent dark:text-dark-accent hover:underline">file an issue</a> for a data dump)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              7. Data Retention
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We retain your game data indefinitely to preserve your progress. If you want your data deleted, <a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="text-light-accent dark:text-dark-accent hover:underline">file an issue</a> and we'll remove it within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              8. Children's Privacy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz does not knowingly collect data from children under 13. If you believe a child has created an account, please <a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="text-light-accent dark:text-dark-accent hover:underline">file an issue</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              9. Changes to This Policy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              10. Contact
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              For questions about this privacy policy or to request data deletion, contact:
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
