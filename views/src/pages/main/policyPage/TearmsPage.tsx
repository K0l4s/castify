import { FaEnvelope, FaPhoneAlt, FaShieldAlt, FaUserLock, FaSyncAlt, FaUsers, FaInfoCircle, FaBars } from "react-icons/fa";
import { useState } from "react";

const sections = [
  { id: "acceptance", icon: <FaInfoCircle className="text-xl text-purple-500" />, label: "Acceptance of Terms" },
  { id: "responsibilities", icon: <FaUsers className="text-xl text-pink-500" />, label: "User Responsibilities" },
  { id: "content", icon: <FaUserLock className="text-xl text-blue-500" />, label: "Content Guidelines" },
  { id: "privacy", icon: <FaShieldAlt className="text-xl text-green-500" />, label: "Privacy" },
  { id: "modifications", icon: <FaSyncAlt className="text-xl text-indigo-500" />, label: "Service Modifications" },
  { id: "termination", icon: <FaUserLock className="text-xl text-yellow-500" />, label: "Termination" },
  { id: "contact", icon: <FaEnvelope className="text-xl text-red-500" />, label: "Contact" },
];

const TermsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900 dark:via-green-800 dark:to-green-900 px-4 py-12">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full bg-white/90 dark:bg-green-900/90 border-r border-green-200 dark:border-green-800 shadow-lg transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:w-64 w-64`}
        style={{ position: sidebarOpen || window.innerWidth >= 768 ? "fixed" : "static" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-200 dark:border-green-800">
          <span className="font-bold text-xl text-green-700 dark:text-green-200">Menu</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <FaBars />
          </button>
        </div>
        <nav className="flex flex-col gap-2 mt-6 px-4">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 text-green-800 dark:text-green-100 font-medium transition"
              onClick={() => setSidebarOpen(false)}
            >
              {section.icon}
              <span>{section.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative max-w-3xl w-full bg-white/90 dark:bg-green-900/90 rounded-3xl shadow-2xl overflow-hidden border border-green-200 dark:border-green-800 backdrop-blur-md">
          {/* Sidebar toggle button for mobile */}
          <button
            className="absolute top-6 left-6 md:hidden z-40 bg-green-700 text-white p-2 rounded-full shadow-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
          <div className="p-8 sm:p-14">
            <div className="flex flex-col items-center mb-8">
              <FaShieldAlt className="text-5xl text-green-700 dark:text-green-200 mb-2" />
              <h1 className="text-4xl font-extrabold text-green-900 dark:text-green-100 text-center tracking-tight">
                Terms of Service
              </h1>
              <p className="text-center text-green-600 dark:text-green-300 mt-2">
                Last updated: <span className="font-semibold text-green-700 dark:text-green-200">{new Date().toLocaleDateString()}</span>
              </p>
            </div>

            <div className="space-y-10 text-green-900 dark:text-green-100">
              <section id="acceptance">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-xl text-purple-500" />
                  <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                </div>
                <p className="ml-6">
                  By accessing and using Blankcil, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section id="responsibilities">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-xl text-pink-500" />
                  <h2 className="text-2xl font-semibold">2. User Responsibilities</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Be at least 13 years old to use the service</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security of their account</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section id="content">
                <div className="flex items-center gap-2 mb-2">
                  <FaUserLock className="text-xl text-blue-500" />
                  <h2 className="text-2xl font-semibold">3. Content Guidelines</h2>
                </div>
                <p className="ml-6">Users are responsible for all content they post. Content must not:</p>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Violate intellectual property rights</li>
                  <li>Contain harmful or malicious code</li>
                  <li>Include inappropriate or offensive material</li>
                  <li>Promote illegal activities</li>
                </ul>
              </section>

              <section id="privacy">
                <div className="flex items-center gap-2 mb-2">
                  <FaShieldAlt className="text-xl text-green-500" />
                  <h2 className="text-2xl font-semibold">4. Privacy</h2>
                </div>
                <p className="ml-6">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section id="modifications">
                <div className="flex items-center gap-2 mb-2">
                  <FaSyncAlt className="text-xl text-indigo-500" />
                  <h2 className="text-2xl font-semibold">5. Service Modifications</h2>
                </div>
                <p className="ml-6">
                  We reserve the right to modify or discontinue any part of our service at any time. We will provide notice of significant changes when possible.
                </p>
              </section>

              <section id="termination">
                <div className="flex items-center gap-2 mb-2">
                  <FaUserLock className="text-xl text-yellow-500" />
                  <h2 className="text-2xl font-semibold">6. Termination</h2>
                </div>
                <p className="ml-6">
                  We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion.
                </p>
              </section>

              <section id="contact">
                <div className="flex items-center gap-2 mb-2">
                  <FaEnvelope className="text-xl text-red-500" />
                  <h2 className="text-2xl font-semibold">7. Contact</h2>
                </div>
                <div className="ml-6 space-y-1">
                  <p>If you have any questions about these terms, please contact us:</p>
                  <div className="flex items-center gap-2 font-medium">
                    <FaEnvelope className="text-base" />
                    <span>Email: support@blankcil.com</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <FaPhoneAlt className="text-base" />
                    <span>Phone: 0000000000</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t mt-12 pt-6 text-center">
              <p className="text-sm text-green-600 dark:text-green-300 tracking-wide">
                © {new Date().getFullYear()} <span className="font-semibold text-green-700 dark:text-green-200">Blank Team</span>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
