import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

interface DefaultModalProps {
    isLogin: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const AuthenticationModal: React.FC<DefaultModalProps> = (props) => {
    const [loginModal, setLoginModal] = useState(props.isLogin);
    const tranformLogin = () => {
        setLoginModal(!loginModal);
    }
    
    const getIsLogin = () => {
        switch (loginModal) {
            case true:
                return <LoginModal trigger={tranformLogin} isOpen={props.isOpen} onClose={props.onClose} />
            case false:
                return <RegisterModal trigger={tranformLogin} isOpen={props.isOpen} onClose={props.onClose} />
            default:
                return <LoginModal  trigger={tranformLogin} isOpen={props.isOpen} onClose={props.onClose} />

        }
    }
    return (
        <>
            {getIsLogin()}
        </>
    )
}

export default AuthenticationModal;