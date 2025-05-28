import React from "react";
import { Link } from "react-router-dom";

interface BannerProps {
    title?: string;
    imageUrl?: string;
    buttonText?: string;
    linkTo?: string;
}

const Banner: React.FC<BannerProps> = (props) => {
    return (
<div className="rounded-lg relative w-full h-60 sm:h-72 md:h-96 lg:h-[28rem] max-h-72 bg-gray-100 dark:bg-gray-800">
            <div className="absolute w-full h-full overflow-hidden rounded-lg">
                <img
                    src={props.imageUrl || "https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg"}
                    alt="Banner"
                    className="w-full h-full object-cover opacity-50 rounded-lg"
                />
            </div>
            <div className="absolute inset-0 to-transparent opacity-100"></div>
            <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 py-10 sm:px-8 md:px-20">
                <h1 className="font-bold text-gray-800 dark:text-white break-words whitespace-normal text-lg sm:text-2xl md:text-4xl lg:text-5xl text-center">
                    {props.title}
                </h1>
                <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto items-center">
                    <Link to={props.linkTo || "/"}>
                        <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition duration-200">
                            {props.buttonText}
                        </button>

                    </Link>
                </div>
            </div >

        </div >
    );
};

export default Banner;
