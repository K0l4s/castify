import React, { useRef, useState, useEffect } from 'react';
import { BiCommentDots } from 'react-icons/bi';
import { BsShareFill } from 'react-icons/bs';
import { PiPause, PiPlay } from 'react-icons/pi';
import { AiFillHeart, AiFillDislike, AiFillFire, AiFillThunderbolt } from 'react-icons/ai';
import { FaAngry } from 'react-icons/fa';
import './Podcast.css';
import PodcastCommentBar from './PodcastCommetBar';

interface PodcastProps {
    videoSrc: string;
    avatarSrc: string;
    title: string;
    author: string;
    voteCount: number;
    dislikeCount: number;
    isLiked: boolean;
    likedType: string;
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
    isLiked,
    likedType,
    commentCount,
    shareCount,
    description,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [showLoveEffect, setShowLoveEffect] = useState(false);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [currentReaction, setCurrentReaction] = useState('none');
    const [showReactionMenu, setShowReactionMenu] = useState(false);
    const reactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [reactionEffects, setReactionEffects] = useState<Array<{id: number, type: string, style: any}>>([]);
    let effectIdCounter = 0;

    // Set initial reaction state based on props
    useEffect(() => {
        if (isLiked && likedType) {
            setCurrentReaction(likedType);
        }
    }, [isLiked, likedType]);

    const reactions = {
        none: {
            icon: <AiFillHeart size={30} color="#808080" />,
            label: 'None',
            effect: 'none'
        },
        love: { 
            icon: <AiFillHeart size={30} color="#FF69B4" />, 
            label: 'Love',
            effect: 'hearts'
        },
        dislike: { 
            icon: <AiFillDislike size={30} color="#FF4500" />, 
            label: 'Dislike',
            effect: 'shake'
        },
        fire: { 
            icon: <AiFillFire size={30} color="#FFA500" />, 
            label: 'Fire',
            effect: 'flames'
        },
        thunder: { 
            icon: <AiFillThunderbolt size={30} color="#FFD700" />, 
            label: 'Thunder',
            effect: 'lightning'
        },
        angry: { 
            icon: <FaAngry size={30} color="#FF0000" />, 
            label: 'Angry',
            effect: 'flames'
        }
    };

    const createReactionEffect = (type: string) => {
        const id = effectIdCounter++;
        let style = {};

        switch(type) {
            case 'hearts':
                // Create multiple floating hearts with varying sizes and paths
                for(let i = 0; i < 15; i++) {
                    const randomX = Math.random() * 100;
                    const randomDelay = Math.random() * 1;
                    const randomSize = Math.random() * 20 + 20; // Size between 20-40px
                    const randomRotation = Math.random() * 360;
                    const randomPath = Math.random() > 0.5 ? 'cubic-bezier(0.25, 0.1, 0.25, 1)' : 'cubic-bezier(0.42, 0, 0.58, 1)';
                    
                    setReactionEffects(prev => [...prev, {
                        id: effectIdCounter++,
                        type: 'hearts',
                        style: {
                            position: 'absolute',
                            left: `${randomX}%`,
                            bottom: '20%',
                            transform: `rotate(${randomRotation}deg) scale(${Math.random() * 0.5 + 0.5})`,
                            animation: `float-up 2.5s ${randomPath} ${randomDelay}s forwards`,
                            opacity: 0,
                            fontSize: `${randomSize}px`
                        }
                    }]);
                }
                break;
            case 'flames':
                // Create dynamic flame effect
                style = {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '70%',
                    animation: 'flames 1.5s ease-out',
                    background: 'linear-gradient(to top, rgba(255,69,0,0.8), rgba(255,140,0,0.6), rgba(255,165,0,0.4), transparent)',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                    transformOrigin: 'bottom'
                };
                break;
            case 'lightning':
                // Create dramatic lightning effect
                style = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    animation: 'lightning 1s cubic-bezier(0.36, 0, 0.66, -0.56)',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9), rgba(255,255,255,0.4), transparent 70%)',
                    mixBlendMode: 'screen',
                    filter: 'brightness(1.5) contrast(2)'
                };
                break;
            case 'shake':
                // Create intense shake effect
                style = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden',
                    perspective: '1000px'
                };
                break;
        }

        setReactionEffects(prev => [...prev, { id, type, style }]);

        // Cleanup effect after animation
        setTimeout(() => {
            setReactionEffects(prev => prev.filter(effect => effect.id !== id));
        }, 2500);
    };

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
        }, 500);
    };

    const handleReactionHover = () => {
        if (reactionTimeout.current) {
            clearTimeout(reactionTimeout.current);
        }
        setShowReactionMenu(true);
    };

    const handleReactionLeave = () => {
        reactionTimeout.current = setTimeout(() => {
            setShowReactionMenu(false);
        }, 2000);
    };

    const handleReactionClick = (reaction: string) => {
        if (currentReaction === reaction) {
            // If clicking the same reaction, remove it
            setCurrentReaction('none');
            setShowLoveEffect(false);
        } else {
            // Set new reaction
            setCurrentReaction(reaction);
            setShowLoveEffect(true);
            createReactionEffect(reactions[reaction as keyof typeof reactions].effect);
            setTimeout(() => setShowLoveEffect(false), 1000);
        }
        setShowReactionMenu(false);
    };

    const toggleComment = () => {
        setIsCommentOpen(!isCommentOpen);
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
            if (reactionTimeout.current) {
                clearTimeout(reactionTimeout.current);
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
        <div className="flex mx-auto">
            {/* Video Container */}
            <div
                className="relative h-[calc(100vh-4rem)] w-[calc((100vh-4rem)*9/16)] max-w-full rounded-xl"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <video
                    ref={videoRef}
                    className="rounded-md object-cover object-center w-full h-full"
                    src={videoSrc}
                    poster="https://phumyhung.vn/the-antonia/wp-content/uploads/2020/04/HT_10-Copy-1.jpg"
                ></video>
                <div className={`absolute top-0 left-0 w-full h-full bg-black rounded-xs transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-50'}`}></div>

                {/* Love Icon in Top Right */}
                <div className="absolute top-4 right-4">
                    {reactions[currentReaction as keyof typeof reactions].icon}
                </div>

                {/* Play/Pause Button */}
                <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                >
                    <button className="text-white text-4xl" onClick={togglePlayPause}>
                        {isPlaying ? <PiPause /> : <PiPlay />}
                    </button>
                </div>

                {/* Bottom Controls */}
                <div
                    className={`absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent transition-opacity rounded-xl duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                >
                    <p className="text-sm mb-2 text-white">{description}</p>

                    <input
                        type="range"
                        className="w-full"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleTimeChange}
                    />
                    <div className="flex text-sm text-white">
                        <span>{formatTime(currentTime)} : </span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div
                    className={`absolute flex flex-col items-center -left-20 bottom-1/2 transform -translate-y-1/2 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
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

                {/* Avatar and Author Info */}
                <div className="absolute top-5 left-4 flex items-center">
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

                {/* Reaction Effects Container */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {reactionEffects.map(effect => (
                        <div key={effect.id} style={effect.style}>
                            {effect.type === 'hearts' && <AiFillHeart size={30} color="#FF69B4" />}
                            {effect.type === 'flames' && <div className="flame-effect" />}
                            {effect.type === 'lightning' && <div className="lightning-effect" />}
                        </div>
                    ))}
                </div>

                {/* Reaction Effect Animation */}
                {showLoveEffect && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {reactions[currentReaction as keyof typeof reactions].icon}
                    </div>
                )}
            </div>

            {/* Interaction Icons */}
            <div className={`flex flex-col space-y-4 p-4 justify-center transition-transform duration-300 ${isCommentOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="flex flex-col items-center relative">
                    <div 
                        className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center"
                        onMouseEnter={handleReactionHover}
                        onMouseLeave={handleReactionLeave}
                        onClick={() => handleReactionClick(currentReaction === 'none' ? 'love' : 'none')}
                    >
                        {reactions[currentReaction as keyof typeof reactions].icon}
                        
                        {/* Reaction Menu */}
                        {showReactionMenu && (
                            <div className="absolute right-full mr-2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
                                {Object.entries(reactions).filter(([key]) => key !== 'none').map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="cursor-pointer hover:scale-110 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReactionClick(key);
                                        }}
                                    >
                                        {value.icon}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-xs font-bold text-black mt-1">{voteCount}</div>
                </div>

                <div className="flex flex-col items-center">
                    <div 
                        className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center"
                        onClick={toggleComment}
                    >
                        <BiCommentDots size={30} color="green" />
                    </div>
                    <div className="text-xs font-bold text-black mt-1">{commentCount}</div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-gray-100 hover:bg-gray-200 transition cursor-pointer rounded-full h-12 w-12 flex items-center justify-center">
                        <BsShareFill size={24} color="blue" />
                    </div>
                    <div className="text-xs font-bold text-black mt-1">{shareCount}</div>
                </div>
            </div>

            {/* Comment Section */}
            <div className={`transition-transform duration-300 ${isCommentOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                {isCommentOpen && <PodcastCommentBar isOpen={isCommentOpen} onClose={toggleComment} />}
            </div>

        </div>
    );
};

export default Podcast;
