import CustomModal from "../../UI/custom/CustomModal";
import { useState } from "react";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface RegisterFormData {
  lastName: string;
  middleName: string;
  firstName: string;
  birthday: string;
  phone: string;
  nickName: string;
  email: string;
  repeatEmail: string;
  password: string;
  repeatPass: string;
  address: string;
}

const RegisterModal = (props: DefaultModalProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    lastName: '',
    middleName: '',
    firstName: '',
    birthday: '',
    phone: '',
    nickName: '',
    email: '',
    repeatEmail: '',
    password: '',
    repeatPass: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form data
    if (formData.email !== formData.repeatEmail) {
      // Show error toast
      return;
    }
    if (formData.password !== formData.repeatPass) {
      // Show error toast
      return;
    }
    // Submit form data
    try {
      // API call here
    } catch (error) {
      // Handle error
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 " +
    "text-white placeholder-gray-400 transition duration-200 ease-in-out transform hover:bg-gray-700/30";
  
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1 tracking-wide";
  
  const buttonClasses = "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg " +
    "shadow-lg text-sm font-semibold text-white transition-all duration-200 ease-in-out " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transform ";

  return (
    <CustomModal 
      animation="zoom" 
      title="Create Your Account" 
      isOpen={props.isOpen} 
      onClose={props.onClose} 
      size="full"
      className="bg-gradient-to-b from-gray-800 to-gray-900"
    >
      <div className="  overflow-y-auto  rounded-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <label htmlFor="lastName" className={labelClasses}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClasses}
                required
                placeholder="Enter your last name"
              />
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClasses}>First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="middleName" className={labelClasses}>Middle Name</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Birthday, Phone, and Nick Name fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="birthday" className={labelClasses}>Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClasses}>Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClasses}
                required
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="nickName" className={labelClasses}>Nickname (Optional)</label>
              <input
                type="text"
                id="nickName"
                name="nickName"
                value={formData.nickName}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="What should we call you?"
              />
            </div>
          </div>

          {/* Email fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClasses}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClasses}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="repeatEmail" className={labelClasses}>Confirm Email</label>
              <input
                type="email"
                id="repeatEmail"
                name="repeatEmail"
                value={formData.repeatEmail}
                onChange={handleInputChange}
                className={inputClasses}
                required
                placeholder="Verify your email"
              />
            </div>
          </div>

          {/* Password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className={labelClasses}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClasses}
                required
                minLength={8}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label htmlFor="repeatPass" className={labelClasses}>Confirm Password</label>
              <input
                type="password"
                id="repeatPass"
                name="repeatPass"
                value={formData.repeatPass}
                onChange={handleInputChange}
                className={inputClasses}
                required
                minLength={8}
                placeholder="Verify your password"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className={labelClasses}>Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={inputClasses}
              required
              placeholder="Enter your full address"
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            className={`${buttonClasses} bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600`}
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              className={`${buttonClasses} bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Sign up with Google
            </button>
            <button
              type="button"
              className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
              </svg>
              Sign up with Facebook
            </button>
          </div>

          {/* Footer links */}
          <div className="flex flex-col items-center space-y-4 pt-6 border-t border-gray-600/50">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Already have an account?</span>
              <button 
                type="button"
                onClick={props.trigger}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
              >
                Sign in instead
              </button>
            </div>
            <button 
              type="button"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default RegisterModal;
