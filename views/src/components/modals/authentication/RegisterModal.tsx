import CustomModal from "../../UI/custom/CustomModal";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal = (props: DefaultModalProps) => {
  return (
    <CustomModal animation="zoom" title="Register" isOpen={props.isOpen} onClose={props.onClose} size="full" >

      <div className="p-4 max-h-screen overflow-y-auto">
        <form className="text-white">
          {/* Name fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-1 gap-2 mb-2">
            {/* Last Name - Spans full width on md, 1/3 on lg */}
            <div className="lg:col-span-1 md:col-span-3 col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Middle Name and First Name - inline on lg, stacked on md */}
            <div className="grid grid-cols-2 lg:col-span-2 md:col-span-3 gap-2">
              <div className="col-span-1">
                <label htmlFor="middleName" className="block text-sm font-medium">Middle Name</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Birthday, Phone, and Nick Name fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-1 gap-2 mb-2">
            {/* Birthday - spans full width on md, 1/3 on lg */}
            <div className="lg:col-span-1 md:col-span-3 col-span-3">
              <label htmlFor="birthday" className="block text-sm font-medium">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Phone and Nick Name - inline on lg, stacked on md */}
            <div className="grid grid-cols-2 lg:col-span-2 md:col-span-3 gap-2">
              <div className="col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="nickName" className="block text-sm font-medium">Nick Name</label>
                <input
                  type="text"
                  id="nickName"
                  name="nickName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Email and Repeat Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="repeatEmail" className="block text-sm font-medium">Repeat Email</label>
              <input
                type="email"
                id="repeatEmail"
                name="repeatEmail"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Password and Repeat Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="repeatPass" className="block text-sm font-medium">Repeat Password</label>
              <input
                type="password"
                id="repeatPass"
                name="repeatPass"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div className="col-span-3 mb-2">
            <label htmlFor="address" className="block text-sm font-medium">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </button>
          {/* Footer links */}
          <div className="flex flex-col mt-2 items-center">
            <h3 className="flex">
              Have an account?
              <div onClick={props.trigger} className="text-blue-500 cursor-pointer ml-2">
                Log In
              </div>
            </h3>
            <h3 className="flex">
              Forgot your password?
              <div className="text-blue-500 cursor-pointer ml-2">Get here</div>
            </h3>
          </div>

          {/* Register with Google and Facebook - Stacked on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4">
              Register with Google
            </button>
            <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4">
              Register with Facebook
            </button>
          </div>
        </form>



      </div>
    </CustomModal>
  );
};

export default RegisterModal;
