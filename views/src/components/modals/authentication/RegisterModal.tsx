import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";
import { userRegister } from "../../../models/User";
import { authenticateApi } from "../../../services/AuthenticateService";
import CustomModal from "../../UI/custom/CustomModal";
import { useEffect, useState } from "react";
// import CustomInput from "../../UI/custom/CustomInput";
import { locationService } from "../../../services/LocationService";
import CustomInput from "../../UI/custom/CustomInput";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
  toggleAuthView: () => void;
}

const RegisterModal = (props: DefaultModalProps) => {
  const [step, setStep] = useState(2);
  const [isRequest, setIsRequest] = useState(false);
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);
  useEffect(() => {
    const fetchProvinces = async () => {
      const provinces = await locationService.getProvinces();
      // console.log(provinces.data);
      setProvincesList(provinces.data);
      console.log(provincesList);
    };
    fetchProvinces();
  }, []);
  const handleProvincesChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    console.log(id === "");
    if (id === "") {
      setDistrictsList([]);
      setWardsList([]);
      return;
    }
    console.log(id);
    const districts = await locationService.getDistricts(id);
    setDistrictsList(districts.data);
  };
  const handleDistrictsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === "") {
      setWardsList([]);
      return;
    }
    console.log(id);
    const wards = await locationService.getWards(id);
    setWardsList(wards.data);
  }
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
    wardId: '',
    phone: ''
  });

  const toast = useToast();


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // kiểm tra sự hợp lệ của email
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid email format");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (formData.email && formData.repeatEmail && formData.password && formData.confirmPassword) {
        setStep(2);
      } else {
        toast.error("Please fill all the fields");
      }
    }
  };

  // const handleReturn = () => {
  //   setStep(1);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // set Ward for formData
    const wardId = document.getElementById("ward") as HTMLSelectElement;
    console.log(wardId.value);
    formData.wardId = wardId.value;
    console.log(formData);
    const loadingToastId = toast.loading("Creating account...");
    setIsRequest(true);
    try {
      // Chuyển đổi ngày sinh thành chuỗi định dạng ISO với thời gian mặc định là "00:00:00"
      const date = new Date(formData.birthday);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0] + "T00:00:00";

      await authenticateApi
        .register({
          ...formData,
          birthday: localDateTime, // Gửi lên với định dạng yyyy-MM-ddTHH:mm:ss
        })
        .then(() => {
          setIsRequest(false);
          toast.clearAllToasts();
          props.onClose();
          props.toggleAuthView();
          toast.success(
            "Account created successfully, Please check your email to verify your account"
          );
        })
        .catch((err) => {
          toast.error(err.response.data);
          toast.closeLoadingToast(loadingToastId);
          setIsRequest(false);
          // toast.clearAllToasts();
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
                  <CustomInput
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
                  <CustomInput
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
                  <CustomInput
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
                  <CustomInput
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
              <div>
                <p className="font-bold text-md">Register for {formData.email} (*)</p>
              </div>
              {/* Step 2 Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelClasses}>First Name</label>
                  <CustomInput
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
                  <CustomInput
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                  <CustomInput
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="birthday" className={labelClasses}>Birthday</label>
                  <CustomInput
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
                  <CustomInput
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
                  <CustomInput
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
                <CustomInput
                  type="text"
                  id="addressElements"
                  name="addressElements"
                  value={formData.addressElements}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Provinces</label>
                  {/* <CustomInput
                      type="text"
                      name="provinces"
                      value={formData.provinces}
                      onChange={handleInputChange}
                      variant="primary"
                      className="mt-1 block w-full"
                    /> */}
                  {/* select */}
                  <select
                    id="provinces"
                    name="provinces"
                    onChange={handleProvincesChange}
                    // value={selectedProvince?.name ? selectedProvince.name : ""}
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  {/* <CustomInput
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      variant="primary"
                      className="mt-1 block w-full"
                    /> */}
                  {/* select */}
                  <select
                    id="district"
                    name="district"
                    onChange={handleDistrictsChange}
                    // value={selectedDistrict?.name ? selectedDistrict.name : ""}
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray -300 mb-1">Ward</label>
                  {/* <CustomInput
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      variant="primary"
                      className="mt-1 block w-full"
                    /> */}
                  {/* select */}
                  <select
                    id="ward"
                    name="ward"
                    // value={selectedDistrict?.name ? selectedDistrict.name : ""}
                    // onChange={handleSelectChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select Ward</option>
                    {wardsList.map(ward => (
                      <option key={ward.id} value={ward.id}>{ward.name}</option>
                    ))}
                  </select>
                </div>
                {/* <div>
                  <label htmlFor="provinces" className={labelClasses}>Province/ City</label>
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
                </div> */}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                By creating an account, you agree to our <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-red-500 dark:text-red-500">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-red-500 dark:text-red-500">Privacy Policy</Link>.
              </p>
              <div className="flex gap-4">
                {/* <button
                  type="button"
                  onClick={handleReturn}
                  className={`${buttonClasses} bg-gray-600 hover:bg-gray-700 ${isRequest && 'cursor-not-allowed bg-gray-400'}`}
                  {...isRequest && { disabled: true }}
                >
                  {isRequest ? 'Loading...' : '< Back'}
                </button> */}
                <button
                  type="submit"
                  className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 ${isRequest && 'cursor-not-allowed bg-gray-600'}`}
                  {...isRequest && { disabled: true }}
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
