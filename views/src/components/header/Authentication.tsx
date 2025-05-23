import { useDispatch } from "react-redux";
import { useToast } from "../../context/ToastProvider";
import { authenticateApi } from "../../services/AuthenticateService";
import { logout } from "../../redux/slice/authSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthenticationModal from "../modals/authentication/AuthenticationModal";
import { useEffect, useRef, useState } from "react";
import ThemeModeSwitch from "../UI/custom/ThemeModeSwitch";
import { RiVideoAddFill } from "react-icons/ri";
import Tooltip from "../UI/custom/Tooltip";
import PodcastUploadModal from "../modals/podcast/PodcastUploadModal";
import CustomButton from "../UI/custom/CustomButton";
import { Role } from "../../constants/Role";
import defaultAvatar from "../../assets/images/default_avatar.jpg";
import { useLanguage } from "../../context/LanguageContext";
import coin from "../../assets/images/coin.png";
import { BsCart3, BsShop } from "react-icons/bs";
import MessageIcon from "./MessageIcon";
import NotificationIcon from "./NotificationIcon";
import Avatar from "../UI/user/Avatar";
import { useClickOutside } from "../../hooks/useClickOutside";
import ChooseGenreModal from "../../pages/main/landingPage/ChooseGenreModal";

const Authentication = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [userDataChecked, setUserDataChecked] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const dispatch = useDispatch();
  const handleLogout = () => {
    setIsLoading(true);
    authenticateApi
      .logout()
      .then(() => {
        // toast.success("Logout successfully");
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        dispatch(logout());
        window.location.reload();
      })
      .catch((error) => {
        toast.error("Logout failed " + error.message);
      }).finally(() => {
        setIsLoading(false);
      });
  };
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isEnable = useSelector((state: RootState) => state.auth.user?.enabled);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    console.log("user: ", user);
  }, [user]);

  useEffect(() => {
    if (isAuth && user && !userDataChecked) {
      const shouldShowModal = !user.favoriteGenreIds || 
                             (Array.isArray(user.favoriteGenreIds) && user.favoriteGenreIds.length === 0);
      
      if (shouldShowModal) {
        setTimeout(() => {
          setShowGenreModal(true);
        }, 300);
      }
      setUserDataChecked(true);
    }
    
    if (!isAuth || !user) {
      setUserDataChecked(false);
    }
  }, [isAuth, user, userDataChecked]);

  useEffect(() => {
    if (!isFirstRender && !isEnable) {
      handleLogout();
    } else {
      setIsFirstRender(false);
    }
  }, [isEnable]);

  useClickOutside(userMenuRef, () => {
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      const dropdown = document.getElementById("dropdown-user");
      dropdown?.classList.add("hidden");
    }
  });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    const dropdown = document.getElementById("dropdown-user");
    dropdown?.classList.toggle("hidden");
  };

  return (
    <div>
      <div className="relative">
        {isAuth ? (
          <div className="flex items-center gap-4">
            {/* blank shop link */}
            {/* <Link
              to="/blank-shop"
              className="px-4 py-2 text-sm border border-gray-500 rounded-full text-black hover:bg-gray-300
              dark:border-gray-300 dark:text-white dark:hover:bg-gray-600">
              <BsCart3 className="inline-block mr-2 ml-1" size={20} />
            </Link> */}
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
                  className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <RiVideoAddFill className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
            <div className="flex items-center">
              {location.pathname.includes("/shop") ? (
                <button
                  onClick={() => navigate('/my-shop')}
                  className="px-4 py-2 text-sm border border-gray-500 rounded-full text-black hover:bg-gray-300
                    dark:border-gray-300 dark:text-white dark:hover:bg-gray-600">
                  <BsShop className="inline-block mr-2 ml-1" size={20} />
                  My Shop
                </button>
              ) : (
                <Tooltip text="Blank Shop">
                  <button 
                    onClick={() => navigate('/shop')}
                    className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <BsCart3 className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
              <MessageIcon />
              <NotificationIcon />
            </div>
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
                // <img
                //   className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors duration-200"
                //   src={
                //     user?.avatarUrl || defaultAvatar
                //   }
                //   alt="User avatar"
                // />
                <Avatar width="w-10" height="h-10" avatarUrl={user?.avatarUrl || defaultAvatar} usedFrame={user?.usedFrame} alt="avatar" />

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
                <p className="text-white font-semibold text-sm">{language.navbar.login}</p>
              </span>
            </CustomButton>
            <ThemeModeSwitch />
            {/* select option */}
            <select
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'vi')}
              className="border-none bg-transparent gap-2 text-green-500"
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
            </select>
          </div>
        )}

        <div
          ref={userMenuRef}
          className={`absolute right-0 top-9 shadow-5xl z-50 ${isUserMenuOpen && isAuth ? "" : "hidden"
            }  mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl drop-shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 transform opacity-100 scale-100 transition-all duration-200`}
          id="dropdown-user"
        >
          <ul className="py-4 flex flex-col gap-1">
            <li>
              <Link
                to={`/profile/${user?.username}`}
                className="flex items-center px-4 hover:dark:bg-white/10 hover:bg-black/10 w-full py-2.5 text-sm text-gray-700  dark:text-gray-300 hover:border-l-4 border-red-300 ease-in-out transition-colors duration-300"
              >
                {language.navbar.profile}
              </Link>
            </li>
            {user?.role === Role.A && (
              <li>
                <Link
                  to="/admin"
                  className="flex items-center px-4 hover:dark:bg-white/10 hover:bg-black/10 py-2.5 text-sm text-gray-700  dark:text-gray-300 hover:border-l-4 border-red-300 ease-in-out transition-colors duration-300"
                >
                  {language.navbar.admin}
                </Link>
              </li>)}
            <li>
              <div className=" px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">{language.navbar.theme}
                  <ThemeModeSwitch /></span>
              </div>


            </li>
            <li>
              <div className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">
                {language.navbar.language}
                {/* select option */}
                <select
                  onChange={(e) => changeLanguage(e.target.value as 'en' | 'vi')}
                  className="border-none bg-transparent text-blue-500"
                >
                  <option value="en">EN</option>
                  <option value="vi">VI</option>
                </select>
              </div>
            </li>
            <li>
              <div className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">
                Blank Coin: {user?.coin}
                <img src={coin} alt="coin" className="w-5 h-5" />
              </div>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 hover:dark:bg-red-300/10 hover:bg-red-500/10 py-2.5 text-sm text-red-700 dark:text-red-300 hover:border-l-4 border-red-900 ease-in-out transition-colors duration-300"
              >
                {language.navbar.logout}
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
      <ChooseGenreModal 
        isOpen={showGenreModal} 
        onClose={() => setShowGenreModal(false)} 
      />
    </div>
  );
};

export default Authentication;
