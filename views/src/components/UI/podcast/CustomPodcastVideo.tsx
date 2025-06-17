import React, { useRef, useState, useEffect, useMemo } from "react";
import { BiLeftArrow, BiPause, BiPlay, BiRightArrow } from "react-icons/bi";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap, MdSkipNext } from "react-icons/md";
import { BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import Tooltip from "../custom/Tooltip";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../user/Avatar";
import { Transcript } from "../../../models/Transcript";
import { getNext, getTranscipts } from "../../../services/PodcastService";
import { Podcast, SolutionModel } from "../../../models/PodcastModel";
import { VideoTracking } from "../../../models/VideoTracking";
import { trackService } from "../../../services/TrackingService";
import ConfirmBoxNoOverlay from "../dialogBox/ConfirmBoxNoOverlay";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { BaseApi } from "../../../utils/axiosInstance";

interface CustomPodcastVideoProps {
    videoSrc: string;
    posterSrc: string;
    title?: string;
    user?: any;
    videoRef: React.RefObject<HTMLVideoElement>;
    podcastId: string;
    solutionModelList?: SolutionModel[];
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const CustomPodcastVideo = ({
    podcastId,
    videoSrc,
    posterSrc,
    videoRef,
    title,
    user,
    solutionModelList = [],
}: CustomPodcastVideoProps) => {
    // console.log(solutionModelList)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const pid = queryParams.get("pid") || podcastId;
    const [formattedSolutionModelList, setFormattedSolutionModelList] = useState<SolutionModel[]>([]);
    useEffect(() => {
        if (solutionModelList && solutionModelList.length > 0) {
            const formattedList = solutionModelList.map((model) => ({
                ...model,
                url: `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(model.url)}`,
            }));
            setFormattedSolutionModelList(formattedList);
            console.log("Formatted solution model list:", formattedList);
        } else {
            setFormattedSolutionModelList([]);
            console.log("No solution model list provided or empty.");
        }
    }, [solutionModelList, podcastId, pid]);
    const [selectedSolution, setSelectedSolution] = useState<SolutionModel | null>(null);
    const handleSolutionSelect = (solution: SolutionModel) => {
        setSelectedSolution(solution);
        const video = videoRef.current;
        if (video) {
            const currentTime = video.currentTime;

            // Gán src mới
            video.src = solution.url;

            // Đợi video load đủ để có thể đặt lại thời gian
            const onCanPlay = () => {
                video.currentTime = currentTime;
                video.play();
                video.removeEventListener("canplay", onCanPlay);
            };

            video.addEventListener("canplay", onCanPlay);
        }
    };

    // const handleDefaultSolutionSelect = () => {
    //    setSelectedSolution(null);
    //     const video = videoRef.current;
    //     if (video) {
    //         const currentTime = video.currentTime;

    //         // Gán src về video gốc
    //         video.src = videoSrc;

    //         // Đợi video load đủ để có thể đặt lại thời gian
    //         const onCanPlay = () => {
    //             video.currentTime = currentTime;
    //             video.play();
    //             video.removeEventListener("canplay", onCanPlay);
    //         };

    //         video.addEventListener("canplay", onCanPlay);
    //     }
    // }


    const containerRef = useRef<HTMLDivElement>(null);
    const [showConfirmBox, setShowConfirmBox] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const handleWaitForVideoLoad = () => {
        setIsLoading(true);
    }
    const handleVideoLoaded = () => {
        setIsLoading(false);
    }
    useEffect(() => {
        console.log("loading video:", isLoading);
    }, [isLoading]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioLevel, setAudioLevel] = useState<number>(1);
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [audioLevelHistory, setAudioLevelHistory] = useState<number>(1);
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [showTranscript, setShowTranscript] = useState<boolean>(false);
    const [nextPodcast, setNextPodcast] = useState<Podcast>({} as Podcast);


    const [ccPosition, setCcPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const handleCCDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const ccElement = e.currentTarget;
        const startX = e.clientX - ccElement.offsetLeft;
        const startY = e.clientY - ccElement.offsetTop;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const x = moveEvent.clientX - startX;
            const y = moveEvent.clientY - startY;
            setCcPosition({ x, y });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    const handleCCTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        const ccElement = e.currentTarget;
        const touch = e.touches[0];
        const startX = touch.clientX - ccElement.offsetLeft;
        const startY = touch.clientY - ccElement.offsetTop;

        const handleTouchMove = (moveEvent: TouchEvent) => {
            const touchMove = moveEvent.touches[0];
            const x = touchMove.clientX - startX;
            const y = touchMove.clientY - startY;
            setCcPosition({ x, y });
        };

        const handleTouchEnd = () => {
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };

        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);
    }
    const id = queryParams.get("pid") as string | "";

    const [videoTracking, setVideoTracking] = useState<VideoTracking>();
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    useEffect(() => {
        const fetchVideoTracking = async () => {
            try {
                const response = await trackService.getVideoTracking(id);
                setVideoTracking(response);
                console.log("Video tracking data:", response);
            } catch (error) {
                console.error("Error fetching video tracking:", error);
            }
        };
        if (currentUserId && id) {
            fetchVideoTracking();
        }
    }, [id]);
    useEffect(() => {
        if (videoRef.current && videoTracking) {
            setShowConfirmBox(true);
            console.log("Video tracking data:", !videoTracking);
        } else
            if (videoRef.current && videoTracking === undefined) {
                videoRef.current.currentTime = 0;
                setCurrentTime(0);
                setIsPlaying(true);
            }
            else {
                setShowConfirmBox(false);
            }
    }, [videoRef, videoTracking, podcastId]);
    const [showNextCountdown, setShowNextCountdown] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownTimeout = useRef<NodeJS.Timeout | null>(null);
    const hasNavigatedToNext = useRef(false);
    const [showCC, setShowCC] = useState<boolean>(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const navigate = useNavigate();

    // --- Buffered state ---
    const [buffered, setBuffered] = useState<number>(0);

    // Update buffered state
    const updateBuffered = () => {
        if (videoRef.current && videoRef.current.buffered.length > 0) {
            let max = 0;
            for (let i = 0; i < videoRef.current.buffered.length; i++) {
                if (videoRef.current.buffered.end(i) > max) {
                    max = videoRef.current.buffered.end(i);
                }
            }
            setBuffered(max);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.addEventListener("progress", updateBuffered);
        video.addEventListener("timeupdate", updateBuffered);
        video.addEventListener("loadedmetadata", updateBuffered);
        return () => {
            video.removeEventListener("progress", updateBuffered);
            video.removeEventListener("timeupdate", updateBuffered);
            video.removeEventListener("loadedmetadata", updateBuffered);
        };
    }, [videoRef]);

    useEffect(() => {
        const fetchNextPodcast = async () => {
            try {
                const response = await getNext(podcastId);
                setNextPodcast(response.data);
            } catch (error) {
                console.error("Error fetching next podcast:", error);
            }
        };
        fetchNextPodcast();
        hasNavigatedToNext.current = false;
        setShowNextCountdown(false);
        setCountdown(5);
    }, [podcastId]);

    useEffect(() => {
        const fetchTranscripts = async () => {
            try {
                const response = await getTranscipts(podcastId);
                setTranscripts(response.data);
            } catch (error) {
                console.error("Error fetching transcripts:", error);
            }
        };
        fetchTranscripts();
    }, [podcastId]);

    const handleChangeAudioLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        changeAudioLevel(parseFloat(e.target.value));
    };
    const changeAudioLevel = (level: number) => {
        if (!videoRef.current) return;
        videoRef.current.volume = level;
        setAudioLevel(level);
    };
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

    const handleSpeedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRate = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.playbackRate = newRate;
        }
        setPlaybackRate(newRate);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate, videoRef]);

    useEffect(() => {
        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
            if (countdownTimeout.current) {
                clearTimeout(countdownTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title ? title : "Sample Podcast Title",
                artist: user ? user.fullname : "Sample User Name",
                artwork: [
                    {
                        src: posterSrc,
                    },
                ],
            });

            navigator.mediaSession.setActionHandler("play", () => {
                if (videoRef.current) {
                    videoRef.current.play();
                }
            });
            navigator.mediaSession.setActionHandler("pause", () => {
                if (videoRef.current) {
                    videoRef.current.pause();
                }
            });
            navigator.mediaSession.setActionHandler("seekbackward", () => {
                if (videoRef.current) {
                    videoRef.current.currentTime -= 10;
                }
            });
            navigator.mediaSession.setActionHandler("seekforward", () => {
                if (videoRef.current) {
                    videoRef.current.currentTime += 10;
                }
            });
            navigator.mediaSession.setActionHandler("previoustrack", () => {
            });
            navigator.mediaSession.setActionHandler("nexttrack", () => {
            });
        }
    }, []);

    const currentTranscript = useMemo(() => {
        if (!transcripts || transcripts.length === 0) return null;
        return transcripts.find(
            (t) =>
                currentTime >= t.start &&
                currentTime <= t.end
        );
    }, [currentTime, transcripts]);

    const renderTranscriptList = () => (
        <div className="max-h-80 overflow-y-auto bg-black/80 rounded-lg p-4 mt-2 text-white text-sm shadow-lg">
            {transcripts.map((t) => (
                <div
                    key={t.id}
                    className={`py-1 px-2 rounded cursor-pointer transition-all duration-150 ${currentTime >= t.start && currentTime <= t.end
                        ? "bg-yellow-400 text-black font-semibold"
                        : "hover:bg-white/10"
                        }`}
                    onClick={() => {
                        if (videoRef.current) {
                            videoRef.current.currentTime = t.start + 0.01;
                            setCurrentTime(t.start + 0.01);
                        }
                    }}
                >
                    <span className="mr-2 text-xs text-gray-300">{formatTime(t.start)}</span>
                    {t.text}
                </div>
            ))}
        </div>
    );

    const lastEndedTimeRef = useRef<number | null>(null);

    const handleVideoEnded = () => {
        if (hasNavigatedToNext.current) return;
        if (nextPodcast && nextPodcast.id) {
            setShowNextCountdown(true);
            setCountdown(5);
            hasNavigatedToNext.current = true;
            lastEndedTimeRef.current = Date.now();
        }
    };

    useEffect(() => {
        if (
            duration > 0 &&
            currentTime >= duration - 0.1 &&
            nextPodcast &&
            nextPodcast.id &&
            !hasNavigatedToNext.current
        ) {
            if (
                !lastEndedTimeRef.current ||
                Date.now() - lastEndedTimeRef.current > 1000
            ) {
                setShowNextCountdown(true);
                setCountdown(5);
                hasNavigatedToNext.current = true;
                lastEndedTimeRef.current = Date.now();
            }
        }
    }, [currentTime, duration, nextPodcast]);

    useEffect(() => {
        if (showNextCountdown) {
            if (countdown > 0) {
                countdownTimeout.current = setTimeout(() => {
                    setCountdown((c) => c - 1);
                }, 1000);
            } else if (countdown === 0 && nextPodcast && nextPodcast.id) {
                hasNavigatedToNext.current = true;
                navigate(`/watch?pid=${nextPodcast.id}`);
            }
        }
        return () => {
            if (countdownTimeout.current) {
                clearTimeout(countdownTimeout.current);
            }
        };
    }, [showNextCountdown, countdown, nextPodcast, navigate]);

    function formatTimeFromSeconds(seconds?: number): string {
        if (seconds === undefined) return '';

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const parts = [];
        if (h > 0) parts.push(h.toString().padStart(2, '0'));
        if (m > 0 || h > 0) parts.push(m.toString().padStart(2, '0'));
        parts.push(s.toString().padStart(2, '0'));

        return parts.join(':');
    }

    return (
        <div
            ref={containerRef}
            className={`container mx-auto relative group ${isFullscreen ? "fullscreen" : ""}`}
        >
            <div
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-black via-gray-900 to-gray-800"
                onMouseMove={handleMouseMove}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
                        <div className="text-white text-lg font-semibold">
                            Đang tải video...
                        </div>
                    </div>
                )
                }
                {/* Video element */}
                <video
                    ref={videoRef}
                    className={`w-full transition-all duration-300 ${isFullscreen ? "h-screen" : "max-h-[720px]"} rounded-2xl m-auto`}
                    poster={posterSrc}
                    src={videoSrc}
                    autoPlay={true}
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onWaiting={handleWaitForVideoLoad}
                    onCanPlay={handleVideoLoaded}
                    onEnded={handleVideoEnded}
                    id="custom-podcast-video"
                />

                {/* Overlay gradient */}
                <div
                    onClick={handlePlayPause}
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                />

                {/* User's avatar and title */}
                {/* Top overlay: avatar, title, and close button */}
                {showControls && (
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 m-4 z-20 pointer-events-none">
                        <div className="flex items-center space-x-3 pointer-events-auto">
                            {user?.avatarUrl && (
                                <Avatar
                                    width="w-10"
                                    height="h-10"
                                    avatarUrl={user.avatarUrl}
                                    usedFrame={user.usedFrame}
                                    alt="avatar"
                                    onClick={() => navigate(`/profile/${user.username}`)}
                                />
                            )}
                            {title && (
                                <span className="text-white font-semibold text-base truncate max-w-xs">{title}</span>
                            )}
                        </div>
                        {/* Example: Close button (optional, remove if not needed) */}
                        {/* <button
                            className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition"
                            onClick={() => navigate(-1)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button> */}
                    </div>
                )}

                {/* Transcript overlay (current) - CC */}
                {showCC && currentTranscript && (
                    <div
                        className="absolute z-20 cursor-move"
                        style={{
                            left: ccPosition.x,
                            top: ccPosition.y,
                            opacity: 0.85,
                            maxWidth: "90vw",
                            minWidth: 320,
                            minHeight: 80,
                            pointerEvents: "auto",
                        }}
                        onMouseDown={handleCCDragStart}
                        onTouchStart={handleCCTouchStart}
                    >
                        <div
                            className="bg-black/90 text-yellow-300 px-8 py-4 rounded-2xl text-2xl font-bold shadow-2xl text-center select-none border-2 border-yellow-400"
                            style={{
                                userSelect: "none",
                                lineHeight: 1.2,
                                letterSpacing: "0.02em",
                            }}
                        >
                            {currentTranscript.text}
                        </div>
                    </div>
                )}

                {/* Countdown overlay when video ends */}
                {showNextCountdown && nextPodcast && nextPodcast.id && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                        <div className="bg-white/95 rounded-2xl px-10 py-8 shadow-2xl flex flex-col items-center border-2 border-yellow-400">
                            <div className="text-xl font-bold text-black mb-3">
                                Sắp chuyển sang video tiếp theo:
                            </div>
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    src={nextPodcast.thumbnailUrl || ""}
                                    alt={nextPodcast.title}
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-yellow-400 shadow"
                                />
                                <div>
                                    <div className="font-bold text-black text-lg">{nextPodcast.title}</div>
                                    <div className="text-gray-600 text-sm">{nextPodcast.user?.fullname || nextPodcast.username}</div>
                                </div>
                            </div>
                            <div className="text-3xl font-extrabold text-yellow-500 mb-4">{countdown}s</div>
                            <div className="flex space-x-6">
                                <button
                                    onClick={() => {
                                        setShowNextCountdown(false);
                                        setCountdown(5);
                                        hasNavigatedToNext.current = false;
                                    }}
                                    className="px-6 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        hasNavigatedToNext.current = true;
                                        setShowNextCountdown(false);
                                        setCountdown(5);
                                        navigate(`/watch?pid=${nextPodcast.id}`);
                                    }}
                                    className="px-6 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                                >
                                    Xem ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls container */}
                <div className={`absolute bottom-0 left-0 right-0 px-3 pb-6 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                    {/* Progress bar */}
                    <div className="mb-5 relative">
                        <div
                            className="absolute left-0 top-1/2 h-2 rounded-lg pointer-events-none"
                            style={{
                                width: `${duration > 0 ? (buffered / duration) * 100 : 0}%`,
                                transform: "translateY(-25%)",
                                background: "#fff9db", // màu vàng nhạt
                                zIndex: 1,
                            }}
                        />
                        {/* Progress line */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            onMouseMove={handleMouseMoveOnSlider}
                            onMouseLeave={handleMouseLeaveSlider}
                            className="w-full cursor-pointer appearance-none h-2 rounded-lg bg-yellow-400/30 hover:bg-yellow-400/50 transition-all relative"
                            style={{
                                background: `linear-gradient(to right, #fabe18 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 0%)`,
                                zIndex: 2,
                                position: "relative",
                            }}
                        />
                        {hoverTime !== null && (
                            <div
                                className="absolute bg-black/90 backdrop-blur-sm text-white px-3 py-1 text-xs rounded-lg shadow-xl"
                                style={{
                                    left: `${(hoverTime / duration) * 100}%`,
                                    transform: "translateX(-50%)",
                                    bottom: "120%",
                                }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}
                    </div>

                    {/* Main controls row */}
                    <div className="flex flex-row items-center justify-between w-full space-x-2">
                        {/* Left controls */}
                        <div className="flex flex-row items-center space-x-2">
                            <Tooltip text="Rewind 10s">
                                <button
                                    onClick={() =>
                                        videoRef.current &&
                                        (videoRef.current.currentTime -= 10)
                                    }
                                    className="p-2 rounded-full text-white hover:bg-yellow-400/30 transition"
                                >
                                    <BiLeftArrow className="w-6 h-6" />
                                </button>
                            </Tooltip>
                            <button
                                onClick={handlePlayPause}
                                className="w-12 h-12 flex justify-center items-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg transform hover:scale-105 transition"
                            >
                                {isPlaying ? (
                                    <BiPause className="w-7 h-7" />
                                ) : (
                                    <BiPlay className="w-7 h-7 ml-1" />
                                )}
                            </button>
                            <Tooltip text="Forward 10s">
                                <button
                                    onClick={() =>
                                        videoRef.current &&
                                        (videoRef.current.currentTime += 10)
                                    }
                                    className="p-2 rounded-full text-white hover:bg-yellow-400/30 transition"
                                >
                                    <BiRightArrow className="w-6 h-6" />
                                </button>
                            </Tooltip>
                            {nextPodcast && nextPodcast.id && (
                                <Tooltip text="Xem video tiếp theo">
                                    <button
                                        onClick={() => {
                                            hasNavigatedToNext.current = true;
                                            setShowNextCountdown(false);
                                            setCountdown(5);
                                            navigate(`/watch?pid=${nextPodcast.id}`);
                                        }}
                                        className="p-2 rounded-full text-white hover:bg-yellow-400/30 transition"
                                    >
                                        <MdSkipNext className="w-6 h-6" />
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        {/* Center controls */}
                        <div className="flex flex-row items-center space-x-3">
                            {/* Volume */}
                            <div className="flex items-center space-x-2">
                                {audioLevel === 0 ? (
                                    <BsVolumeMute
                                        className="text-white w-6 h-6 cursor-pointer"
                                        onClick={() =>
                                            changeAudioLevel(audioLevelHistory)
                                        }
                                    />
                                ) : (
                                    <BsVolumeUp
                                        className="text-white w-6 h-6 cursor-pointer"
                                        onClick={() => {
                                            setAudioLevelHistory(audioLevel);
                                            changeAudioLevel(0);
                                        }}
                                    />
                                )}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={audioLevel}
                                    onChange={handleChangeAudioLevel}
                                    className="w-24 h-2 rounded-lg cursor-pointer appearance-none bg-yellow-400/30"
                                    style={{
                                        background: `linear-gradient(to right, #fabe18 ${audioLevel * 100}%, rgba(255,255,255,0.2) 0%)`,
                                    }}
                                />
                            </div>
                            {/* Time */}
                            <div className="text-white text-sm font-mono px-2 select-none rounded bg-black/40">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        {/* Right controls */}
                        <div className="flex flex-row items-center space-x-2">
                            {/* Speed select */}
                            <select
                                value={playbackRate}
                                onChange={handleSpeedSelect}
                                className="bg-black/60 text-yellow-400 rounded px-3 py-1 border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
                                style={{ minWidth: 60 }}
                            >
                                {SPEEDS.map((speed) => (
                                    <option key={speed} value={speed}>
                                        {speed}x
                                    </option>
                                ))}
                            </select>
                            {/* solution select option */}
                            {formattedSolutionModelList.length > 0 && (
                                <select
                                    value={selectedSolution?.solution || ""}
                                    onChange={(e) => {

                                        const selected = formattedSolutionModelList.find(
                                            (s) => s.solution.toString() === e.target.value
                                        );
                                        handleSolutionSelect(selected!);

                                    }}
                                    className="bg-black/60 text-yellow-400 rounded px-3 py-1 border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
                                    style={{ minWidth: 80 }}
                                >
                                    <option value={formattedSolutionModelList[0]?.solution || ""}>Chất lượng gốc</option>
                                    {formattedSolutionModelList.map((solution) => (
                                        <option key={solution.solution} value={solution.solution}>
                                            {solution.solution}x
                                        </option>
                                    ))}
                                </select>
                            )}
                            {/* Transcript/CC buttons */}
                            <Tooltip text={showTranscript ? "Ẩn transcript" : "Xem transcript"}>
                                <button
                                    onClick={() => setShowTranscript((v) => !v)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-yellow-400 text-yellow-400 bg-black/40 hover:bg-yellow-400 hover:text-black transition`}
                                >
                                    {showTranscript ? "Ẩn transcript" : "Xem transcript"}
                                </button>
                            </Tooltip>
                            <Tooltip text={showCC ? "Ẩn CC" : "Hiện CC"}>
                                <button
                                    onClick={() => setShowCC((v) => !v)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-yellow-400 text-yellow-400 bg-black/40 hover:bg-yellow-400 hover:text-black transition`}
                                >
                                    {showCC ? "Ẩn CC" : "Hiện CC"}
                                </button>
                            </Tooltip>
                            {/* Fullscreen Button */}
                            <Tooltip
                                text={
                                    isFullscreen
                                        ? "Exit fullscreen"
                                        : "Enter fullscreen"
                                }
                            >
                                <button
                                    onClick={handleFullscreenToggle}
                                    className="p-2 rounded-full text-white hover:bg-yellow-400/30 transition"
                                >
                                    {isFullscreen ? (
                                        <MdOutlineZoomInMap className="w-6 h-6" />
                                    ) : (
                                        <MdOutlineZoomOutMap className="w-6 h-6" />
                                    )}
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Transcript list panel */}
                {showTranscript && (
                    <div className="absolute left-1/2 bottom-36 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4">
                        {renderTranscriptList()}
                    </div>
                )}
            </div>
            <ConfirmBoxNoOverlay
                title="Xem tiếp video?"
                message={"Chúng tôi nhận thấy bạn đã xem video này đến " + formatTimeFromSeconds(videoTracking?.pauseTime) + " giây. Bạn có muốn tiếp tục xem không?"}
                isOpen={showConfirmBox}
                onConfirm={() => {
                    setShowConfirmBox(false);
                    if (videoRef.current && videoTracking) {
                        videoRef.current.currentTime = videoTracking.pauseTime;
                        setCurrentTime(videoTracking.pauseTime);
                        videoRef.current.play();
                    }
                }}
                onCancel={() => {
                    setShowConfirmBox(false)
                }}
                confirmText="Yes"
                cancelText="No"
            />
        </div>
    );
};

export default CustomPodcastVideo;
