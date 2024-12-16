import React, { useRef, useState, useEffect } from "react";
import { BiLeftArrow, BiPause, BiPlay, BiRightArrow } from "react-icons/bi";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap } from "react-icons/md";
import { BsVolumeUp } from "react-icons/bs";
import Tooltip from "../custom/Tooltip";

interface CustomPodcastVideoProps {
    videoSrc: string;
    posterSrc: string;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const CustomPodcastVideo = ({ videoSrc, posterSrc, videoRef }: CustomPodcastVideoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioLevel, setAudioLevel] = useState(1);
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChangeAudioLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        videoRef.current.volume = parseFloat(e.target.value);
        setAudioLevel(parseFloat(e.target.value));
    }

    const resetHideControlsTimeout = () => {
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => setShowControls(false), 2000);
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
        setShowControls(true);
        resetHideControlsTimeout();
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            videoRef.current.currentTime = parseFloat(e.target.value);
            setCurrentTime(videoRef.current.currentTime);
        }
        setShowControls(true);
        resetHideControlsTimeout();
    };

    const handleMouseMoveOnSlider = (e: React.MouseEvent<HTMLInputElement>) => {
        const rect = (e.target as HTMLInputElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = offsetX / rect.width;
        setHoverTime(percent * duration);
    };

    const handleMouseLeaveSlider = () => {
        setHoverTime(null);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        resetHideControlsTimeout();
    };

    const handleFullscreenToggle = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`container mx-auto p-4 relative group ${isFullscreen ? "fullscreen" : ""}`}
        >
            <div
                className="relative rounded-xl overflow-hidden shadow-2xl bg-black"
                onMouseMove={handleMouseMove}
            >
                <video
                    ref={videoRef}
                    className="w-full h-full rounded-xl m-auto"
                    poster={posterSrc}
                    src={videoSrc}
                    autoPlay={true}
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    // onClick={handlePlayPause}
                />

                {/* Overlay gradient */}
                <div
                onClick={handlePlayPause}
                 className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Time display */}
                <div className={`absolute right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 text-sm rounded-full shadow-lg transition-all duration-300 bottom-4`}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Controls container */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    {/* Progress bar */}
                    <div className={`mb-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            onMouseMove={handleMouseMoveOnSlider}
                            onMouseLeave={handleMouseLeaveSlider}
                            className="w-full cursor-pointer appearance-none h-1.5 rounded-lg bg-white/30 hover:bg-white/40 transition-all"
                            style={{
                                background: `linear-gradient(to right, #8B5CF6 ${((currentTime / duration) * 100).toFixed(2)}%, rgba(255,255,255,0.3) 0%)`,
                            }}
                        />
                        {hoverTime !== null && (
                            <div
                                className="absolute -top-8 bg-black/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs rounded-lg shadow-xl"
                                style={{
                                    left: `${(hoverTime / duration) * 100}%`,
                                    transform: "translateX(-50%)",
                                }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}
                    </div>

                    {/* Control buttons */}
                    <div className={`flex items-center space-x-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                        <Tooltip text="Rewind 10s">
                            <button
                                onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                                className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                            >
                                <BiLeftArrow className="w-5 h-5" />
                            </button>
                        </Tooltip>

                        <button
                            onClick={handlePlayPause}
                            className="w-12 h-12 flex justify-center items-center rounded-full bg-white/90 hover:bg-white text-purple-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            {isPlaying ? <BiPause className="w-6 h-6" /> : <BiPlay className="w-6 h-6 ml-1" />}
                        </button>

                        <Tooltip text="Forward 10s">
                            <button
                                onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                                className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                            >
                                <BiRightArrow className="w-5 h-5" />
                            </button>
                        </Tooltip>

                        <div className="flex items-center ml-auto space-x-4">
                            <div className="flex items-center space-x-2">
                                <BsVolumeUp className="text-white w-5 h-5" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={audioLevel}
                                    onChange={handleChangeAudioLevel}
                                    className="w-20 h-1.5 rounded-lg cursor-pointer appearance-none"
                                    style={{
                                        background: `linear-gradient(to right, #8B5CF6 ${audioLevel * 100}%, rgba(255,255,255,0.3) 0%)`,
                                    }}
                                />
                            </div>

                            <Tooltip text={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                                <button
                                    onClick={handleFullscreenToggle}
                                    className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    {isFullscreen ? 
                                        <MdOutlineZoomInMap className="w-5 h-5" /> : 
                                        <MdOutlineZoomOutMap className="w-5 h-5" />
                                    }
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPodcastVideo;