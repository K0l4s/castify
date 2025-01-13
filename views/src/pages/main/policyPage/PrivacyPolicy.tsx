
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">Privacy Policy</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Last updated: <span className="font-medium">07/01/2025</span>
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Personal information: Name, email address, phone number, profile picture.</li>
                <li>Content you upload: Video podcasts, comments, likes.</li>
                <li>Device information: IP, operating system, browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">2. How We Use Information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide and maintain services.</li>
                <li>Personalize user experience.</li>
                <li>Contact customer support.</li>
                <li>Develop new features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">3. Sharing Information</h2>
              <p>We do not sell your personal information. We share information with third parties only when you consent or when required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">4. Securing Information</h2>
              <p>We use technical and organizational measures to protect your personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Access, edit, or delete your information.</li>
                <li>Withdraw consent at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">6. Policy Changes</h2>
              <p>This policy may be updated. We will notify you via email or our homepage.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">7. Contact</h2>
              <p>For any questions, please contact us:</p>
              <p className="font-medium">Email: blankcil.st@gmail.com</p>
              <p className="font-medium">Phone: 0000000000</p>
            </section>
          </div>

          <div className="border-t mt-10 pt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Blank Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;