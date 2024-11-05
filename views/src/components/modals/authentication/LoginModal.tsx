import { useDispatch, useSelector } from "react-redux";
import CustomModal from "../../UI/custom/CustomModal";
import Cookies from 'js-cookie';
import { User } from "../../../models/User";
import { authenticateApi } from "../../../services/AuthenticateService";
import { userService } from "../../../services/UserService";
import { login, setUser } from "../../../redux/slice/authSlice";
import { useEffect } from "react";
import { RootState } from "../../../redux/store";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ trigger, isOpen, onClose }: DefaultModalProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await authenticateApi.login({
        email: e.currentTarget.email.value,
        password: e.currentTarget.password.value,
      });

      if (!res.data) {
        throw new Error('No data');
      }

      // Set token and refresh token in cookies
      Cookies.set('token', res.data.access_token, { expires: 1 });
      Cookies.set('refreshToken', res.data.refresh_token, { expires: 7 });

      // Fetch user information
      const userRes = await userService.getUser();
      const user: User = userRes.data;
      dispatch(login());
      dispatch(setUser(user));
      
    } catch (err: any) {
      console.error("Login error:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        url: err.config?.url
      });
    }
  };
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);
  return (
    <CustomModal animation="zoom" title="Login" isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</button>
        </form>
        {/* Login with Google and Facebook buttons */}
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4">Login with Google</button>
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4">Login with Facebook</button>
        <h3>Don't have an account? <span onClick={trigger} className="text-blue-500 cursor-pointer">Register</span></h3>
        <h3>Forgot your password? <span className="text-blue-500 cursor-pointer">Get here</span></h3>
      </div>
    </CustomModal>
  );
};

export default LoginModal;
