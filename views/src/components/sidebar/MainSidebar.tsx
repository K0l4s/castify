import { Link, useLocation } from "react-router-dom";

const MainSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-52 h-screen pt-20 text-black 
      transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700
      dark:text-white
      " aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-1 px-2 flex-1">
            <li>
              <Link to="/" className={`text-black dark:text-white ${pathname === "/" || pathname === "/feed" ? " text-red-500 dark:text-red-500 " : ""}  font-semibold text-sm flex items-center rounded-md left-0 hover:left-1 relative transition-all p-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[18px] h-[18px] mr-4" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                <span>Global</span>
              </Link>
            </li>

            <li>
              <Link to="/feed/follow" className={`text-black dark:text-white ${pathname === "/feed/follow" ? "text-red-500 dark:text-red-500" : ""}  font-semibold text-sm flex items-center rounded-md left-0 hover:left-1 relative transition-all p-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[18px] h-[18px] mr-4" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>Follow</span>
              </Link>
            </li>

            <li>
              <Link to="/feed/trend" className={`text-black dark:text-white ${pathname === "/feed/trend" ? "text-red-500 dark:text-red-500" : ""}  font-semibold text-sm flex items-center rounded-md left-0 hover:left-1 relative transition-all p-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[18px] h-[18px] mr-4" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
                <span>Trending</span>
              </Link>
            </li>
            {/* line */}
            <div className="h-[1px] w-full bg-black dark:bg-gray-200 my-4"></div>

            <li>
              <Link to="/reactions" className={`text-black dark:text-white ${pathname === "/reactions" ? "text-red-500 dark:text-red-500" : ""}  font-semibold text-sm flex items-center rounded-md left-0 hover:left-1 relative transition-all p-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[18px] h-[18px] mr-4" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/reactions" className={`text-black dark:text-white ${pathname === "/reactions" ? "text-red-500 dark:text-red-500" : ""}  font-semibold text-sm flex items-center rounded-md left-0 hover:left-1 relative transition-all p-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[18px] h-[18px] mr-4" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>Reactions</span>
              </Link>
            </li>
            <div className="h-[1px] w-full bg-black dark:bg-gray-200 my-4"></div>

            <p className="text-sm text-black dark:text-gray-200 px-2">
              Followed Users
            </p>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default MainSidebar