import { useDispatch } from "react-redux";
import { useToast } from "../../context/ToastProvider";
import { authenticateApi } from "../../services/AuthenticateService";
import { logout } from "../../redux/slice/authSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import AuthenticationModal from "../modals/authentication/AuthenticationModal";
import { useEffect, useState } from "react";

const Authentication = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');

    const toast = useToast();
    const dispatch = useDispatch();
    const handleLogout = () => {
        authenticateApi.logout().then(() => {
            toast.success('Logout successfully');
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            dispatch(logout());
        }).catch((error) => {
            toast.error('Logout failed ' + error.message);
        });
    }
    const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
        const dropdown = document.getElementById("dropdown-user");
        dropdown?.classList.toggle("hidden");
    }
    const user = useSelector((state: RootState) => state.auth.user);
    // console.log(user);

    const toggleTheme = () => {
        if (mode === 'light') {
            setMode('dark');
        } else {
            setMode('light');
        }
        localStorage.setItem('theme', mode);
        // document.documentElement.classList.toggle('dark', mode === 'dark');
        console.log(mode)
    }
    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);


    return <div className="flex items-center">
        <div className="relative ms-3">
            {isAuth ? (
                <button
                    onClick={toggleUserMenu}
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                >
                    <img className="w-8 h-8 rounded-full" src={user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png'} alt="User avatar" />
                </button>
            ) : (
                <button
                    onClick={handleOpen}
                    className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
                >
                    Login
                </button>
            )}

            <div className={`fixed right-0 top-10 z-50 ${isUserMenuOpen ? '' : 'hidden'} my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600`} id="dropdown-user">
                <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">Admin</p>
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">Switch to user</p>
                </div>
                <ul className="py-1">
                    <li>
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Settings</Link>
                    </li>
                    <li>
                        <Link to="/earnings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</Link>
                    </li>
                    {/* thememode */}
                    <li>
                        <button onClick={toggleTheme} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
                            {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</button>
                    </li>
                </ul>
            </div>
        </div>
        <AuthenticationModal isLogin={true} isOpen={isOpen} onClose={handleClose} />
    </div>
}

export default Authentication
