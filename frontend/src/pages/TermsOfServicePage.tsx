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

        <h1 className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          Terms of Service
        </h1>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none space-y-6 text-light-text-primary dark:text-dark-text-primary">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <strong>Last Updated:</strong> April 28, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              By accessing and using RGBPuzz ("the Service"), you agree to these Terms of Service. RGBPuzz is operated for educational and entertainment purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
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
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              3. No Account Required
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              RGBPuzz does not require registration or sign-in. All game data is stored locally in your browser. No personal information is collected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
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
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              All content, code, design, and game mechanics are owned by the operators of RGBPuzz. The source code is available under the MIT License on GitHub. You may not copy, redistribute, or create derivative works without proper attribution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR UNINTERRUPTED OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE OPERATORS OF RGBPUZZ BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES WHATSOEVER, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF DATA, LOSS OF PROFITS, LOSS OF GOODWILL, BUSINESS INTERRUPTION, OR ANY OTHER COMMERCIAL DAMAGES OR LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE), EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              YOUR SOLE AND EXCLUSIVE REMEDY FOR DISSATISFACTION WITH THE SERVICE IS TO STOP USING IT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              8. Indemnification
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              You agree to defend, indemnify, and hold harmless the operators of RGBPuzz from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including but not limited to attorney's fees) arising from: (a) your use of the Service; (b) your violation of these Terms; or (c) your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              9. Data and Privacy
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Your use of the Service is also governed by our Privacy Policy. All game data is stored locally in your browser. We do not collect or store any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              10. Service Modifications
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
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              11. Governing Law
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              These Terms shall be governed by the laws of the United States without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              12. Contact Information
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              For questions about these Terms, contact:
            </p>
            <p className="text-light-accent dark:text-dark-accent mt-2">
              RGBPuzz<br />
              <a href="mailto:legal@rgbpuzz.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                legal@rgbpuzz.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              13. Entire Agreement
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
