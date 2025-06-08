import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "../../redux/store";
import { SiYoutubestudio } from "react-icons/si";
import { useToast } from "../../context/ToastProvider";
import { useLanguage } from "../../context/LanguageContext";
import { BsFire } from "react-icons/bs";
import FollowingSidebar from "./FollowingSidebar";
import { MdLiveTv } from "react-icons/md";

const MainSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { language } = useLanguage();

  const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const toast = useToast();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return ` ${isActive ? 'text-red-500 dark:text-red-500 border-b-0 border-red-500' : ' border-black dark:border-white'} font-semibold text-sm flex items-center left-0 relative transition-all p-2`;
  };
  // fixed top-0 left-0

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.warning("Please login to do this action");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 h-screen z-40 shadow-lg transition-all duration-300
      ${isOpenSideBar ? 'w-56' : 'w-20'}
      bg-gradient-to-b from-white via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      border-r border-gray-200 dark:border-gray-700 text-black dark:text-white`}
        aria-label="Sidebar"
      >
        <div className="h-full px-4 pb-4 overflow-y-auto pt-20 flex flex-col">
          <ul className="space-y-2 flex-1">
            <li>
              <Link
                to="/"
                className={
                  getLinkClass("/") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-red-500 dark:group-hover:text-red-500 transition`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.home}</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                to="/feed/trend"
                className={
                  getLinkClass("/feed/trend") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
              >
                <BsFire
                  size={24}
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-orange-500 dark:group-hover:text-orange-400 transition`}
                />
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.trending}</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                to="/feed/follow"
                className={
                  getLinkClass("/feed/follow") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-blue-500 dark:group-hover:text-blue-400 transition`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.follow}</span>
                )}
              </Link>
            </li>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 my-4"></div>

            <li>
              <Link
                to="/feed/history"
                className={
                  getLinkClass("/feed/history") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-purple-500 dark:group-hover:text-purple-400 transition`}
                  viewBox="0 0 24 24"
                >
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.history}</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                to="/feed/liked"
                className={
                  getLinkClass("/feed/liked") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-pink-500 dark:group-hover:text-pink-400 transition`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.react}</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                to="/playlist"
                className={
                  getLinkClass("/playlist") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className={`w-6 h-6 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-green-500 dark:group-hover:text-green-400 transition`}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 5.25A.75.75 0 0 1 3.75 4.5h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4A.75.75 0 0 1 3.75 8.5h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.25Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" />
                  <path d="M16.5 13.5v5.379l2.25-1.43 2.25-1.43-2.25-1.43-2.25-1.43z" />
                </svg>
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.playlist}</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                to="/browse-rooms"
                className={
                  getLinkClass("/browse-rooms") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <MdLiveTv
                  className={`w-6 h-6 mb-1 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition`}
                />
                {isOpenSideBar && (
                  <span className="truncate">Watch Party</span>
                )}
              </Link>
            </li>
          </ul>

          <FollowingSidebar isOpen={isOpenSideBar} />

          <ul className="space-y-2 mt-10">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 my-4"></div>
            <li>
              <Link
                to="/creator/dashboard"
                className={
                  getLinkClass("/creator/dashboard") +
                  " group hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                }
                onClick={handleClick}
              >
                <SiYoutubestudio
                  className={`w-5 h-5 ${isOpenSideBar ? "mr-4" : "mx-auto"} group-hover:text-red-600 dark:group-hover:text-red-500 transition`}
                />
                {isOpenSideBar && (
                  <span className="truncate">{language.sidebar.studio}</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default MainSidebar;
