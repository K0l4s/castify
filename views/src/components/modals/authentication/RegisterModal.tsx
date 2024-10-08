
import CustomModal from "../../UI/custom/CustomModal"

interface DefaultModalProps {
  trigger: ()=>void;
  isOpen: boolean;
  onClose: () => void
}
const LoginModal = (props:DefaultModalProps) => {
  return (
    <CustomModal animation="slide" title="Register" isOpen={props.isOpen} onClose={props.onClose}>
      <div className="p-4">
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</button>
        </form>
        {/* login with Google button */}
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4">Login with Google</button>
        {/* login with Facebook button */}
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4">Login with Facebook</button>
        <h3>Have an account? <div onClick={props.trigger} className="text-blue-500 cursor-pointer">Log In</div></h3>
        <h3>Forgot your password? <div className="text-blue-500 cursor-pointer">Get here</div></h3>
      </div>
    </CustomModal>
  )
}

export default LoginModal