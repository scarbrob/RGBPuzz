import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        {/* Honest disclaimer — not a legal shield, just transparency */}
        <div className="glass-card p-4 sm:p-5 mb-6 border-l-4 border-yellow-500/70 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Heads up:</strong> These terms were drafted by the project's
            developer, not by an attorney. They aim to be plain-language and
            reasonable, but they are not legal advice. If you have legal
            questions, please consult a qualified lawyer in your jurisdiction.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 md:p-10 space-y-6 text-light-text-primary dark:text-dark-text-primary">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Last Updated:</strong> April 30, 2026
          </p>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              By accessing or using RGBPuzz at rgbpuzz.com (the "Service"), you
              agree to these Terms of Service. If you do not agree, do not use
              the Service. The Service is offered free of charge for educational
              and entertainment purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              2. Description of Service
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz is a free browser-based color-sorting puzzle game. It
              allows you to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Play color-sorting puzzles (RGB and Spectrum modes)</li>
              <li>Track your progress and statistics locally in your browser</li>
              <li>Participate in daily and level-based challenges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              3. No Account Required
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              The Service does not require registration, sign-in, or any
              personal information. All game data is stored locally in your
              browser. See our{' '}
              <Link to="/privacy" className="text-light-accent dark:text-dark-accent hover:underline">
                Privacy Policy
              </Link>{' '}
              for details on the limited technical data (e.g. IP address) that
              our hosting infrastructure necessarily processes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              4. Acceptable Use
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Attempt to break, hack, or exploit the Service or its infrastructure</li>
              <li>Use automated tools, scripts, or bots to play, scrape, or stress-test the Service</li>
              <li>Circumvent rate limits or other technical protections</li>
              <li>Use the Service to violate any applicable laws or regulations</li>
              <li>Misrepresent the Service or its origin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              5. Intellectual Property &amp; Open Source
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              The RGBPuzz source code is published on GitHub under the{' '}
              <strong>MIT License</strong>. You may copy, modify, and
              redistribute the source code under the terms of that license,
              which requires preserving the copyright notice and license text.
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              The "RGBPuzz" name, branding, domain, and game design concept are
              not granted by the MIT License and remain the property of the
              project's operators. Please do not publish derivative works under
              the same name in a way that would cause confusion about the
              official Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
              NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR UNINTERRUPTED
              OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM HARMFUL
              COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL THE OPERATORS OF RGBPUZZ BE LIABLE FOR ANY DIRECT, INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES
              WHATSOEVER, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF
              PROFITS, LOSS OF GOODWILL, BUSINESS INTERRUPTION, OR ANY OTHER
              LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR
              INABILITY TO USE THE SERVICE, HOWEVER CAUSED AND UNDER ANY THEORY
              OF LIABILITY (CONTRACT, STRICT LIABILITY, TORT, OR OTHERWISE),
              EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              IF, NOTWITHSTANDING THE FOREGOING, A COURT OF COMPETENT
              JURISDICTION DETERMINES THAT WE ARE LIABLE TO YOU, OUR TOTAL
              CUMULATIVE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO
              THE SERVICE SHALL NOT EXCEED <strong>USD $0.00</strong> (THE
              AMOUNT YOU PAID FOR THE SERVICE).
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              YOUR SOLE AND EXCLUSIVE REMEDY FOR DISSATISFACTION WITH THE
              SERVICE IS TO STOP USING IT.
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3 italic">
              Some jurisdictions do not allow the exclusion or limitation of
              certain damages. In those jurisdictions, our liability is limited
              to the smallest amount permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              8. Indemnification
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              You agree to defend, indemnify, and hold harmless the operators of
              RGBPuzz from and against any claims, damages, obligations, losses,
              liabilities, costs, and expenses (including reasonable attorneys'
              fees) arising from: (a) your misuse of the Service in violation
              of Section 4; (b) your violation of these Terms; or (c) your
              violation of applicable law or third-party rights through your
              use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              9. Service Modifications
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We reserve the right, at any time and without prior notice, to:
            </p>
            <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <li>Modify, suspend, or discontinue the Service in whole or in part</li>
              <li>Change these Terms (changes take effect on posting)</li>
              <li>Add, remove, or modify features</li>
              <li>Adjust rate limits or technical protections</li>
            </ul>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              Continued use of the Service after changes constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              10. Force Majeure
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              We are not liable for any failure or delay in providing the
              Service caused by events outside our reasonable control,
              including but not limited to outages of upstream providers
              (e.g. Microsoft Azure), network disruption, denial-of-service
              attacks, natural disasters, or government actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              11. Governing Law &amp; Venue
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              These Terms are governed by the laws of the{' '}
              <strong>State of Washington, USA</strong>, without regard to its
              conflict-of-laws principles. Any dispute arising out of or
              related to these Terms or the Service shall be brought
              exclusively in the state or federal courts located in{' '}
              <strong>King County, Washington</strong>, and you consent to the
              personal jurisdiction of those courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              12. Severability
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              If any provision of these Terms is held invalid or unenforceable
              by a court of competent jurisdiction, the remaining provisions
              shall remain in full force and effect, and the invalid provision
              shall be interpreted to most closely reflect its original intent
              within the limits of applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              13. No Waiver
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Our failure to enforce any right or provision of these Terms
              shall not be considered a waiver of that right or provision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              14. Entire Agreement
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              These Terms, together with the{' '}
              <Link to="/privacy" className="text-light-accent dark:text-dark-accent hover:underline">
                Privacy Policy
              </Link>
              , constitute the entire agreement between you and RGBPuzz
              regarding the Service and supersede any prior agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-light-accent dark:text-dark-accent mb-3">
              15. Contact
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Questions about these Terms:
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
