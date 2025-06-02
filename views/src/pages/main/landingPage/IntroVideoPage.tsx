import { useEffect, useRef, useState } from "react";
import Intro from "../../../assets/videos/Intro.mp4";
import CustomModal from "../../../components/UI/custom/CustomModal";

const LOCALSTORAGE_KEY = "podcast_intro_skipped";

const IntroVideoPage = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const skipped = localStorage.getItem(LOCALSTORAGE_KEY);
        if (skipped !== "true") {
            setIsOpen(true);
        }
    }, []);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleSkip = () => {
        localStorage.setItem(LOCALSTORAGE_KEY, "true");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <CustomModal title="WHAT'S CASTIFY?" isOpen={isOpen} onClose={handleSkip} size="xl">
            <div className="relative w-full h-full">
                <video
                    ref={videoRef}
                    className="w-full h-auto rounded-md"
                    src={Intro}
                    autoPlay
                    muted
                    playsInline
                    controls
                />
               

                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 px-4 py-2 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 z-10"
                >
                    Bỏ qua
                </button>
            </div>
        </CustomModal>
    );
};

export default IntroVideoPage;
