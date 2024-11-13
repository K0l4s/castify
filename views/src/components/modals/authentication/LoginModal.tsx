import { useDispatch, useSelector } from "react-redux";
import CustomModal from "../../UI/custom/CustomModal";
import Cookies from 'js-cookie';
import { User } from "../../../models/User";
import { authenticateApi } from "../../../services/AuthenticateService";
import { userService } from "../../../services/UserService";
import { login, setUser } from "../../../redux/slice/authSlice";
import { useEffect, useState } from "react";
import { RootState } from "../../../redux/store";
import { LoginInput } from "../../../models/Authentication";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useToast } from "../../../context/ToastProvider";


interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ trigger, isOpen, onClose }: DefaultModalProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: ''
  });
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      toast.loading('Logging in...');
      const res = await authenticateApi.login(formData);

      if (!res.data) {
        throw new Error('Authentication failed');
      }

      // Set token and refresh token in cookies with secure flags
      Cookies.set('token', res.data.access_token, { 
        expires: 1,
        secure: true,
        sameSite: 'strict'
      });
      Cookies.set('refreshToken', res.data.refresh_token, { 
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });

      // Fetch user information
      const userRes = await userService.getUser(res.data.access_token);
      const user: User = userRes.data;
      
      dispatch(login());
      dispatch(setUser(user));
      // toast.success('Login successful!');
      toast.info('Login successful!');
      
    } catch (err: any) {
      console.error("Login error:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        url: err.config?.url
      });
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Implement social login logic here
    toast.info(`${provider} login coming soon!`);
  };

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  return (
    <CustomModal animation="zoom" title="Welcome Back" isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Or Username
            </label>
            <input 
              // type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 dark:bg-gray-800">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <FaGoogle className="w-5 h-5 text-red-600" />
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <FaFacebook className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button onClick={trigger} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Register here
            </button>
          </p>
          <p className="mt-2">
            <button className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Forgot your password?
            </button>
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default LoginModal;
