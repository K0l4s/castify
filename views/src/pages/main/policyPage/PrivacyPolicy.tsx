import { FaEnvelope, FaPhoneAlt, FaShieldAlt, FaUserLock, FaSyncAlt, FaUsers, FaInfoCircle, FaBars } from "react-icons/fa";
import { useState } from "react";

const sections = [
  { id: "info", icon: <FaInfoCircle className="text-xl text-purple-500" />, label: "Information We Collect" },
  { id: "use", icon: <FaUsers className="text-xl text-pink-500" />, label: "How We Use Information" },
  { id: "sharing", icon: <FaUserLock className="text-xl text-blue-500" />, label: "Sharing Information" },
  { id: "security", icon: <FaShieldAlt className="text-xl text-green-500" />, label: "Securing Information" },
  { id: "rights", icon: <FaUserLock className="text-xl text-yellow-500" />, label: "Your Rights" },
  { id: "changes", icon: <FaSyncAlt className="text-xl text-indigo-500" />, label: "Policy Changes" },
  { id: "contact", icon: <FaEnvelope className="text-xl text-red-500" />, label: "Contact" },
];

const PrivacyPolicy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full bg-white/90 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 shadow-lg transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:w-64 w-64`}
        style={{ position: sidebarOpen || window.innerWidth >= 768 ? "fixed" : "static" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">Menu</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
        <FaBars />
          </button>
        </div>
        <nav className="flex flex-col gap-2 mt-6 px-4">
          {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition"
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
        <div className="relative max-w-3xl w-full bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 backdrop-blur-md">
          {/* Sidebar toggle button for mobile */}
          <button
            className="absolute top-6 left-6 md:hidden z-40 bg-blue-600 text-white p-2 rounded-full shadow-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
          <div className="p-8 sm:p-14">
            <div className="flex flex-col items-center mb-8">
              <FaShieldAlt className="text-5xl text-blue-600 dark:text-blue-400 mb-2" />
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Last updated: <span className="font-semibold text-blue-600 dark:text-blue-400">07/01/2025</span>
              </p>
            </div>

            <div className="space-y-10 text-gray-700 dark:text-gray-300">
              <section id="info">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-xl text-purple-500" />
                  <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Personal information: Name, email address, phone number, profile picture.</li>
                  <li>Content you upload: Video podcasts, comments, likes.</li>
                  <li>Device information: IP, operating system, browser.</li>
                </ul>
              </section>

              <section id="use">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-xl text-pink-500" />
                  <h2 className="text-2xl font-semibold">2. How We Use Information</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Provide and maintain services.</li>
                  <li>Personalize user experience.</li>
                  <li>Contact customer support.</li>
                  <li>Develop new features.</li>
                </ul>
              </section>

              <section id="sharing">
                <div className="flex items-center gap-2 mb-2">
                  <FaUserLock className="text-xl text-blue-500" />
                  <h2 className="text-2xl font-semibold">3. Sharing Information</h2>
                </div>
                <p className="ml-6">
                  We do not sell your personal information. We share information with third parties only when you consent or when required by law.
                </p>
              </section>

              <section id="security">
                <div className="flex items-center gap-2 mb-2">
                  <FaShieldAlt className="text-xl text-green-500" />
                  <h2 className="text-2xl font-semibold">4. Securing Information</h2>
                </div>
                <p className="ml-6">
                  We use technical and organizational measures to protect your personal information.
                </p>
              </section>

              <section id="rights">
                <div className="flex items-center gap-2 mb-2">
                  <FaUserLock className="text-xl text-yellow-500" />
                  <h2 className="text-2xl font-semibold">5. Your Rights</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Access, edit, or delete your information.</li>
                  <li>Withdraw consent at any time.</li>
                </ul>
              </section>

              <section id="changes">
                <div className="flex items-center gap-2 mb-2">
                  <FaSyncAlt className="text-xl text-indigo-500" />
                  <h2 className="text-2xl font-semibold">6. Policy Changes</h2>
                </div>
                <p className="ml-6">
                  This policy may be updated. We will notify you via email or our homepage.
                </p>
              </section>

              <section id="contact">
                <div className="flex items-center gap-2 mb-2">
                  <FaEnvelope className="text-xl text-red-500" />
                  <h2 className="text-2xl font-semibold">7. Contact</h2>
                </div>
                <div className="ml-6 space-y-1">
                  <p>For any questions, please contact us:</p>
                  <div className="flex items-center gap-2 font-medium">
                    <FaEnvelope className="text-base" />
                    <span>Email: blankcil.st@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <FaPhoneAlt className="text-base" />
                    <span>Phone: 0000000000</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t mt-12 pt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
                © 2025 <span className="font-semibold text-blue-600 dark:text-blue-400">Blank Team</span>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;