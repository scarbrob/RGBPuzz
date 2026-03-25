import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none space-y-6 text-light-text dark:text-dark-text">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Last Updated:</strong> March 24, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              By accessing and using RGBPuzz ("the Service"), you agree to these Terms of Service. This is a personal project created by Benjamin Scarbrough for educational and entertainment purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              2. Description of Service
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz is a free online color puzzle game. The Service allows you to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Play color-matching puzzle challenges</li>
              <li>Track your progress and statistics locally in your browser</li>
              <li>Participate in daily challenges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              3. No Account Required
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz does not require registration or sign-in. All game data is stored locally in your browser. No personal information is collected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              4. Acceptable Use
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Attempt to hack, reverse engineer, or exploit the Service</li>
              <li>Use automated tools or bots to play the game</li>
              <li>Overload or disrupt the Service infrastructure</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              All content, code, design, and game mechanics are owned by Benjamin Scarbrough. The source code is available under the MIT License on GitHub. You may not copy, redistribute, or create derivative works without proper attribution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected</li>
              <li>That the Service is free from viruses or harmful components</li>
              <li>The accuracy or reliability of any content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              To the maximum extent permitted by law, Benjamin Scarbrough shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              8. Data and Privacy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Your use of the Service is also governed by our Privacy Policy. All game data is stored locally in your browser. We do not collect or store any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              9. Service Modifications
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Modify or discontinue the Service at any time</li>
              <li>Change these Terms of Service with notice</li>
              <li>Remove or modify features without prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              10. Governing Law
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              These Terms shall be governed by the laws of the United States without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              11. Contact Information
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              For questions about these Terms, contact:
            </p>
            <p className="text-light-accent dark:text-dark-accent mt-2">
              Benjamin Scarbrough<br />
              <a href="https://github.com/scarbrob/RGBPuzz/issues" target="_blank" rel="noopener noreferrer" className="hover:underline">
                GitHub Issues
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-3">
              12. Entire Agreement
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              These Terms, along with the Privacy Policy, constitute the entire agreement between you and RGBPuzz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
