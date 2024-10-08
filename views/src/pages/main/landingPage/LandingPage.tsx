
import { useState } from "react";
import CustomButton from "../../../components/UI/custom/CustomButton"
import AuthenticationModal from "../../../components/modals/authentication/AuthenticationModal";


const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <CustomButton className="w-1/12 h-1/12" text="Hello World" onClick={handleOpen}/>
      <AuthenticationModal isLogin={true} isOpen={isOpen} onClose={handleClose}/>
    </div>
  )
}

export default LandingPage