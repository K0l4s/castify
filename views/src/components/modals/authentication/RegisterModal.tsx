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
    if (formData.email !== formData.repeatEmail) {
      return;
    }
    if (formData.password !== formData.repeatPass) {
      return;
    }
    try {
      // API call here
    } catch (error) {
      // Handle error
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-800/30 border border-gray-700 rounded-md " + 
    "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500";
  
  const labelClasses = "text-sm font-medium text-gray-300";
  
  const buttonClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md " +
    "text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "focus:ring-offset-gray-800 transition-colors duration-200";

  return (
    <CustomModal 
      animation="zoom" 
      title="Create Account" 
      isOpen={props.isOpen} 
      onClose={props.onClose} 
      size="lg"
      className="bg-gray-900"
    >
      <div className="px-4 py-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lastName" className={labelClasses}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label htmlFor="phone" className={labelClasses}>Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="nickName" className={labelClasses}>Nickname</label>
              <input
                type="text"
                id="nickName"
                name="nickName"
                value={formData.nickName}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClasses}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClasses}
                required
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
              />
            </div>
          </div>

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
              />
            </div>
          </div>

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
            />
          </div>

          <button
            type="submit"
            className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700`}
          >
            Create Account
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className={`${buttonClasses} bg-red-600 hover:bg-red-700`}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <button 
              type="button"
              onClick={props.trigger}
              className="hover:text-gray-300"
            >
              Sign in instead
            </button>
            <span>•</span>
            <button 
              type="button"
              className="hover:text-gray-300"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default RegisterModal;
