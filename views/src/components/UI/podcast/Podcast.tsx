import React, { useRef, useState, useEffect } from 'react';
import { BiCommentDots } from 'react-icons/bi';
import { BsShareFill } from 'react-icons/bs';
import { GiLoveHowl } from 'react-icons/gi';
import { PiPause, PiPlay } from 'react-icons/pi';

interface PodcastProps {
    videoSrc: string;
    avatarSrc: string;
    title: string;
    author: string;
    voteCount: number;
    dislikeCount: number;
    commentCount: number;
    shareCount: number;
    description: string;
}

const Podcast: React.FC<PodcastProps> = ({
    videoSrc,
    avatarSrc,
    title,
    author,
    voteCount,
    dislikeCount,
    // commentCount,
    shareCount,
    description,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = duration * parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const updateTime = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
    };

    const handleMouseLeave = () => {
        hideControlsTimeout.current = setTimeout(() => {
            setIsHovered(false);
        }, 500); // 5 giây
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.addEventListener('timeupdate', updateTime);
        }
        return () => {
            if (video) {
                video.removeEventListener('timeupdate', updateTime);
            }
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, []);
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <div
            className="relative flex h-96 md:h-[36rem] xl:w-full md:w-[320px] sm:space-x-4 rounded-xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Container */}
            <div className="relative m-auto h-full">
                <video
                    ref={videoRef}
                    className="rounded-md object-cover object-center w-full h-full"
                    src={videoSrc}
                    poster="https://phumyhung.vn/the-antonia/wp-content/uploads/2020/04/HT_10-Copy-1.jpg"
                ></video>
                <div className={`absolute top-0 left-0 w-full h-full bg-black rounded-xs  transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-50'}`}></div>

                {/* Play/Pause Button */}
                <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <button className="text-white text-4xl" onClick={togglePlayPause}>
                        {isPlaying ? <PiPause /> : <PiPlay />}
                    </button>
                </div>

                {/* Bottom Controls */}
                <div
                    className={`absolute bottom-0  w-full p-4 bg-gradient-to-t from-black to-transparent transition-opacity rounded-xl duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <p className="text-sm mb-2">{description}</p>

                    <input
                        type="range"
                        className="w-full"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleTimeChange}
                    />
                    <div className="flex text-sm">
                        <span>{formatTime(currentTime)} : </span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div
                    className={`absolute flex flex-col items-center -left-20 bottom-1/2 transform -translate-y-1/2 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <span className="text-white mb-10">🔊</span>
                    <input
                        type="range"
                        className="w-20 transform rotate-90"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>

                {/* Interaction Icons */}
                <div className="absolute -right-20 bottom-32 flex flex-col space-y-4 p-2">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center">
                            <GiLoveHowl size={30} color="red" />
                        </div>
                        <div className="text-xs font-bold text-gray-600">{voteCount}</div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center">
                            <BiCommentDots size={30} color="green" />
                        </div>
                        <div className="text-xs font-bold text-gray-600">{dislikeCount}</div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center">
                            <BsShareFill size={24} color="blue" />
                        </div>
                        <div className="text-xs font-bold text-gray-600">{shareCount}</div>
                    </div>
                </div>

                {/* Avatar and Author Info */}
                <div className="absolute top-5 left-10 flex items-center">
                    <img
                        src={avatarSrc}
                        alt={author}
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div className="ml-3 text-white">
                        <p className="text-sm font-semibold">{author}</p>
                        <p className="text-xs opacity-80">{title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Podcast;
