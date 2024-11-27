import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

interface AuthenticationModalProps {
    isLogin: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({ isLogin, isOpen, onClose }) => {
    const [isLoginView, setIsLoginView] = useState(isLogin);

    const toggleAuthView = () => {
        setIsLoginView(prev => !prev);
    };

    const renderAuthModal = () => {
        if (isLoginView) {
            return (
                <LoginModal 
                    trigger={toggleAuthView}
                    isOpen={isOpen}
                    onClose={onClose}
                />
            );
        }
        return (
            <RegisterModal
                trigger={toggleAuthView}
                isOpen={isOpen} 
                onClose={onClose}
                toggleAuthView={toggleAuthView}
            />
        );
    };

    return renderAuthModal();
};

export default AuthenticationModal;