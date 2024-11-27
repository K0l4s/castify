import { useDispatch } from "react-redux";
import { useToast } from "../../context/ToastProvider";
import { authenticateApi } from "../../services/AuthenticateService";
import { logout } from "../../redux/slice/authSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthenticationModal from "../modals/authentication/AuthenticationModal";
import { useState } from "react";
import ThemeModeSwitch from "../UI/custom/ThemeModeSwitch";
import { RiVideoAddFill } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import Tooltip from "../UI/custom/Tooltip";
import PodcastUploadModal from "../modals/podcast/PodcastUploadModal";
import CustomButton from "../UI/custom/CustomButton";

const Authentication = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();
  const dispatch = useDispatch();
  const handleLogout = () => {
    setIsLoading(true);
    authenticateApi
      .logout()
      .then(() => {
        toast.success("Logout successfully");
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        dispatch(logout());
      })
      .catch((error) => {
        toast.error("Logout failed " + error.message);
      }).finally(() => {
        setIsLoading(false);
      });
  };
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    const dropdown = document.getElementById("dropdown-user");
    dropdown?.classList.toggle("hidden");
  };
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <div>
      <div className="relative">
        {isAuth ? (
          <div className="flex items-center gap-4">
            {location.pathname.includes("/creator") ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm border border-gray-500 rounded-full text-black hover:bg-gray-300
                  dark:border-gray-300 dark:text-white dark:hover:bg-gray-600">
                <RiVideoAddFill className="inline-block mr-2 ml-1" size={20} />
                Upload
              </button>
            ) : (

              <Tooltip text="Upload">
                <button
                  onClick={() => navigate('/creator/contents')}
                  className="px-4 py-2 text-sm border border-gray-500 rounded-full text-black hover:bg-gray-300
                  dark:border-gray-300 dark:text-white dark:hover:bg-gray-600">
                  <RiVideoAddFill className="inline-block mr-2 ml-1" size={20} />
                  <p className="hidden sm:inline">Upload</p>
                </button>
              </Tooltip>
            )}

            <Tooltip text="Notifications">
              <button className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <IoIosNotifications className="w-6 h-6" />
              </button>
            </Tooltip>

            <button
              onClick={toggleUserMenu}
              className={`flex text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-transform duration-200 hover:scale-105 ${isLoading ? "animate-pulse" : ""
                }`}
              aria-expanded={isUserMenuOpen}
              aria-label="User menu"
            >
              {isLoading ? (
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
              ) : (
                <img
                  className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors duration-200"
                  src={
                    user?.avatarUrl ||
                    "https://cdn-icons-png.flaticon.com/512/9203/9203764.png"
                  }
                  alt="User avatar"
                />
              )}
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-4">
            <CustomButton
              onClick={handleOpen}
              rounded="full"
              variant="danger"
              isShining={true}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <p className="text-white font-semibold text-sm">Login</p>
              </span>
            </CustomButton>
            <ThemeModeSwitch />
          </div>
        )}

        <div
          className={`absolute right-0 top-12 z-50 ${isUserMenuOpen && isAuth ? "" : "hidden"
            } w-64 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 transform opacity-100 scale-100 transition-all duration-200`}
          id="dropdown-user"
        >
          <div className="px-4 py-3 space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Switch to user
            </p>
          </div>
          <ul className="py-1">
            <li>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                Settings
              </Link>
            </li>
            <li>
              <div className=" px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">Theme
                  <ThemeModeSwitch /></span>
              </div>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
      <AuthenticationModal
        isLogin={true}
        isOpen={isOpen}
        onClose={handleClose}
      />
      <PodcastUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Authentication;
