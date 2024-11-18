const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-700 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Jungle overlay pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMGMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzB2NjBjLTE2LjU2OSAwLTMwLTEzLjQzMS0zMC0zMHoiIGZpbGw9InJnYmEoMCwyNTUsMCwwLjEpIi8+Cjwvc3ZnPg==')] opacity-10"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-8 border border-green-600/20">
          <h1 className="text-3xl font-bold text-green-50 mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-green-50">
            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using Blankcil, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">2. User Responsibilities</h2>
              <p>Users must:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Be at least 13 years old to use the service</li>
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of their account</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">3. Content Guidelines</h2>
              <p>Users are responsible for all content they post. Content must not:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Violate intellectual property rights</li>
                <li>Contain harmful or malicious code</li>
                <li>Include inappropriate or offensive material</li>
                <li>Promote illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">4. Privacy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">5. Service Modifications</h2>
              <p>We reserve the right to modify or discontinue any part of our service at any time. We will provide notice of significant changes when possible.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">6. Termination</h2>
              <p>We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-green-100 mb-4">7. Contact</h2>
              <p>If you have any questions about these terms, please contact us at support@blankcil.com</p>
            </section>
          </div>

          <div className="mt-8 text-sm text-green-200">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
