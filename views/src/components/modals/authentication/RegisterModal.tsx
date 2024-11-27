import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";
import { userRegister } from "../../../models/User";
import { authenticateApi } from "../../../services/AuthenticateService";
import CustomModal from "../../UI/custom/CustomModal";
import { useEffect, useState } from "react";
import { locationService } from "../../../services/LocationService";
import { district, provinces, ward } from "../../../models/Location";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
  toggleAuthView: () => void;
}

const RegisterModal = (props: DefaultModalProps) => {
  const [step, setStep] = useState(1);
  const [provincesList, setProvincesList] = useState<provinces[]>([]);
  const [districtsList, setDistrictsList] = useState<district[]>([]);
  const [wardsList, setWardsList] = useState<ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [isRequest,setIsRequest] = useState(false);


  const [formData, setFormData] = useState<userRegister>({
    lastName: '',
    middleName: '',
    firstName: '',
    email: '',
    repeatEmail: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthday: new Date(),
    addressElements: '',
    ward: '',
    district: '',
    provinces: '',
    phone: ''
  });

  const toast = useToast();

  // Fetch provinces when modal is open
  useEffect(() => {
    if (props.isOpen) {
      const fetchData = async () => {
        try {
          const response = await locationService.getProvinces();
          setProvincesList(response.data.data);
        } catch (error) {
          toast.error("Failed to load provinces");
        }
      }
      fetchData();
    }
  }, [props.isOpen]);

  // Fetch districts based on selected province
  useEffect(() => {
    console.log(selectedProvinceId);
    if (selectedProvinceId) {
      const fetchData = async () => {
        try {
          const response = await locationService.getDistricts(selectedProvinceId);
          setDistrictsList(response.data.data);
        } catch (error) {
          toast.error("Failed to load districts");
        }
      };
      fetchData();
    }
  }, [selectedProvinceId]);

  // Fetch wards based on selected district
  useEffect(() => {
    if (selectedDistrictId) {
      const fetchData = async () => {
        try {
          const response = await locationService.getWards(selectedDistrictId);
          setWardsList(response.data.data);
        } catch (error) {
          toast.error("Failed to load wards");
        }
      };
      fetchData();
    }
  }, [selectedDistrictId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    // console.log(value);
    // console.log(name)
    console.log(formData)
    // Update selected province/district ID and formData
    if (name === 'provinces') {
      setSelectedProvinceId(value);
      const province = provincesList.find(province => province.id === value);
      console.log(province);
      setFormData(prev => ({
        ...prev,
        provinces: province?.name || '',
        district: '', // Reset district and ward when province changes
        ward: ''
      }));
      setDistrictsList([]);
      setWardsList([]);
    } else if (name === 'district') {
      setSelectedDistrictId(value);
     
      const district = districtsList.find(district => district.id === value);
      
      setFormData(prev => ({
        ...prev,
        district: district?.name || '',
        ward: '' // Reset ward when district changes
      }));
      setWardsList([]);
      console.log(formData)
    } else if (name === 'ward') {
      // const
      setFormData(prev => ({
        ...prev,
        ward: value
      }));
    }
  };

  const validateStep1 = () => {
    if (formData.email !== formData.repeatEmail) {
      toast.error("Emails do not match");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      if (formData.email && formData.repeatEmail && formData.password && formData.confirmPassword) {
        setStep(2);
      } else {
        toast.error("Please fill all the fields");
      }
    }
  };

  const handleReturn = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Creating account...");
    setIsRequest(true);
    try {
      await authenticateApi.register(formData).then(() => {
        
        setIsRequest(false);
        toast.clearAllToasts();
        props.onClose();
        props.toggleAuthView();
        toast.success("Account created successfully, Please check your email to verify your account");
        // window.open('/login', '_blank');
      }).catch(err => {
        toast.error(err.response.data);
        setIsRequest(false);
        toast.clearAllToasts();
      });
    } catch (error) {
      toast.clearAllToasts();
      setIsRequest(false);
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
      title={step === 1 ? "Create Account - Step 1" : "Create Account - Step 2"}
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="lg"
    >
      <div className="px-4 py-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
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
                  <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700`}
              >
                Next
              </button>
            </>
          ) : (
            <>
              {/* Step 2 Fields */}
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
                    value={formData.birthday instanceof Date ? formData.birthday.toISOString().split('T')[0] : formData.birthday}
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
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="addressElements" className={labelClasses}>Hamlet</label>
                <input
                  type="text"
                  id="addressElements"
                  name="addressElements"
                  value={formData.addressElements}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="provinces" className={labelClasses}>District</label>
                  <select
                    id="provinces"
                    name="provinces"
                    value={selectedProvinceId}
                    onChange={handleSelectChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select Provinces</option>
                    {provincesList.map(province => (
                      <option key={province.id} value={province.id}>{province.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    name="district"
                    value={selectedDistrictId}
                    onChange={handleSelectChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select District</option>
                    {districtsList.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ward">Ward</label>
                  <select
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleSelectChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select Ward</option>
                    {wardsList.map(ward => (
                      <option key={ward.id} value={ward.name}>{ward.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                By creating an account, you agree to our <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-red-500 dark:text-red-500">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-red-500 dark:text-red-500">Privacy Policy</Link>.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleReturn}
                  className={`${buttonClasses} bg-gray-600 hover:bg-gray-700 ${isRequest && 'cursor-not-allowed bg-gray-400'}`}
                  {...isRequest && {disabled: true}} 
                >
                  {isRequest ? 'Loading...' : '< Back'}
                </button>
                <button
                  type="submit"
                  className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 ${isRequest && 'cursor-not-allowed bg-gray-600'}`}
                  {...isRequest && {disabled: true}}
                >
                  {isRequest ? 'Loading...' : 'Create Account'}
                </button>
              </div>
            </>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className={`${buttonClasses} bg-red-600 hover:bg-red-700`}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
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
    </CustomModal >
  );
};


export default RegisterModal;
