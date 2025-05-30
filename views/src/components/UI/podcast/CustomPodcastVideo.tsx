import React, { useRef, useState, useEffect, useMemo } from "react";
import { BiLeftArrow, BiPause, BiPlay, BiRightArrow } from "react-icons/bi";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap, MdSkipNext } from "react-icons/md";
import { BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import Tooltip from "../custom/Tooltip";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../user/Avatar";
import { Transcript } from "../../../models/Transcript";
import { getNext, getTranscipts } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";
import { VideoTracking } from "../../../models/VideoTracking";
import { trackService } from "../../../services/TrackingService";
import ConfirmBoxNoOverlay from "../dialogBox/ConfirmBoxNoOverlay";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface CustomPodcastVideoProps {
    videoSrc: string;
    posterSrc: string;
    title?: string;
    user?: any;
    videoRef: React.RefObject<HTMLVideoElement>;
    podcastId: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const CustomPodcastVideo = ({
    podcastId,
    videoSrc,
    posterSrc,
    videoRef,
    title,
    user,
}: CustomPodcastVideoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showConfirmBox, setShowConfirmBox] = useState(false);
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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
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
        // console.log(user)
        if (currentUserId && id) {
            fetchVideoTracking();
        }
    }, [id]);
    // Video tracking logic
    useEffect(() => {
        if (videoRef.current && videoTracking) {
            // videoRef.current.currentTime = videoTracking.pauseTime;
            // setCurrentTime(videoTracking.pauseTime);
            setShowConfirmBox(true);
            // setIsPlaying(true);
        }
    }, [videoRef, videoTracking]);
    // Countdown state for next video
    const [showNextCountdown, setShowNextCountdown] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownTimeout = useRef<NodeJS.Timeout | null>(null);

    // Prevent multiple triggers of next video navigation
    const hasNavigatedToNext = useRef(false);

    // New state for CC overlay (black transcript overlay)
    const [showCC, setShowCC] = useState<boolean>(false);

    // Playback speed state
    const [playbackRate, setPlaybackRate] = useState<number>(1);

    // Responsive menu bar state
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();

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
        // Reset navigation flag when podcastId changes
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

    // Handle playback rate change
    const handleSpeedUp = () => {
        if (!videoRef.current) return;
        const currentIdx = SPEEDS.findIndex((s) => s === playbackRate);
        if (currentIdx < SPEEDS.length - 1) {
            const newRate = SPEEDS[currentIdx + 1];
            videoRef.current.playbackRate = newRate;
            setPlaybackRate(newRate);
        }
    };

    const handleSpeedDown = () => {
        if (!videoRef.current) return;
        const currentIdx = SPEEDS.findIndex((s) => s === playbackRate);
        if (currentIdx > 0) {
            const newRate = SPEEDS[currentIdx - 1];
            videoRef.current.playbackRate = newRate;
            setPlaybackRate(newRate);
        }
    };

    // Handle playback rate select
    const handleSpeedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRate = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.playbackRate = newRate;
        }
        setPlaybackRate(newRate);
    };

    // Sync playbackRate with video element
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
            // Set metadata for the media session
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title ? title : "Sample Podcast Title",
                artist: user ? user.fullname : "Sample User Name",
                artwork: [
                    {
                        src: posterSrc,
                    },
                ],
            });

            // Set playback actions
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
                // Logic for previous track
            });
            navigator.mediaSession.setActionHandler("nexttrack", () => {
                // Logic for next track
            });
        }
    }, []);

    // Find the current transcript segment based on currentTime
    const currentTranscript = useMemo(() => {
        if (!transcripts || transcripts.length === 0) return null;
        return transcripts.find(
            (t) =>
                currentTime >= t.start &&
                currentTime <= t.end
        );
    }, [currentTime, transcripts]);

    // For transcript list, highlight the current one
    const renderTranscriptList = () => (
        <div className="max-h-64 overflow-y-auto bg-black/80 rounded-lg p-4 mt-2 text-white text-sm shadow-lg">
            {transcripts.map((t) => (
                <div
                    key={t.id}
                    className={`py-1 px-2 rounded cursor-pointer transition-all duration-150 ${currentTime >= t.start && currentTime <= t.end
                        ? "bg-yellow-400 text-black font-semibold"
                        : "hover:bg-white/10"
                        }`}
                    onClick={() => {
                        if (videoRef.current) {
                            videoRef.current.currentTime = t.start + 0.01; // avoid edge case at exact start
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

    // --- FIX: handle auto next video when ended ---
    // We use a ref to store the last ended event time to prevent double triggers
    const lastEndedTimeRef = useRef<number | null>(null);

    const handleVideoEnded = () => {
        // Prevent multiple triggers
        if (hasNavigatedToNext.current) return;
        if (nextPodcast && nextPodcast.id) {
            setShowNextCountdown(true);
            setCountdown(5);
            hasNavigatedToNext.current = true;
            lastEndedTimeRef.current = Date.now();
        }
    };

    // Listen for currentTime updates to detect if video is at end (for browsers that don't fire onEnded reliably)
    useEffect(() => {
        if (
            duration > 0 &&
            currentTime >= duration - 0.1 && // allow a small threshold
            nextPodcast &&
            nextPodcast.id &&
            !hasNavigatedToNext.current
        ) {
            // Prevent double trigger if just ended
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
        // eslint-disable-next-line
    }, [currentTime, duration, nextPodcast]);

    // Countdown effect
    useEffect(() => {
        if (showNextCountdown) {
            if (countdown > 0) {
                countdownTimeout.current = setTimeout(() => {
                    setCountdown((c) => c - 1);
                }, 1000);
            } else if (countdown === 0 && nextPodcast && nextPodcast.id) {
                // Always navigate when countdown reaches 0
                hasNavigatedToNext.current = true;
                navigate(`/watch?pid=${nextPodcast.id}`);
            }
        }
        return () => {
            if (countdownTimeout.current) {
                clearTimeout(countdownTimeout.current);
            }
        };
        // eslint-disable-next-line
    }, [showNextCountdown, countdown, nextPodcast, navigate]);

    // Responsive: collapse menu bar on small screens
    // We'll use a hamburger menu for <md screens for the control bar
    // The menu bar will be hidden under a button on small screens
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
                className="relative rounded-xl overflow-hidden shadow-2xl bg-black"
                onMouseMove={handleMouseMove}
            >
                <video
                    ref={videoRef}
                    className={`w-full ease-in-out duration-300 ${isFullscreen ? "h-screen" : "h-[480px]"} rounded-xl m-auto`}
                    poster={posterSrc}
                    src={videoSrc}
                    autoPlay={true}
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    id="custom-podcast-video"
                />

                {/* Overlay gradient */}
                <div
                    onClick={handlePlayPause}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                {/* user's avatar */}
                {user?.avatarUrl && title && (
                    <div
                        className={`px-3 absolute right-0 duration-300 ease-in-out flex items-center space-x-4 ${showControls ? "bottom-32" : "bottom-5"
                            }`}
                    >
                        <Avatar
                            width="w-10"
                            height="h-10"
                            avatarUrl={user.avatarUrl}
                            usedFrame={user.usedFrame}
                            alt="avatar"
                            onClick={() => navigate(`/profile/${user.username}`)}
                        />
                    </div>
                )}

                {/* Transcript overlay (current) - CC */}
                {showCC && currentTranscript && (
                    <div className="absolute left-1/2 bottom-28 transform -translate-x-1/2 z-20">
                        <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-base font-medium shadow-lg max-w-xl text-center select-none">
                            {currentTranscript.text}
                        </div>
                    </div>
                )}



                {/* Countdown overlay when video ends */}
                {showNextCountdown && nextPodcast && nextPodcast.id && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                        <div className="bg-white/90 rounded-lg px-8 py-6 shadow-2xl flex flex-col items-center">
                            <div className="text-lg font-semibold text-black mb-2">
                                Sắp chuyển sang video tiếp theo:
                            </div>
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    src={nextPodcast.thumbnailUrl || ""}
                                    alt={nextPodcast.title}
                                    className="w-16 h-16 rounded object-cover border border-gray-300"
                                />
                                <div>
                                    <div className="font-bold text-black">{nextPodcast.title}</div>
                                    <div className="text-gray-600 text-sm">{nextPodcast.user?.fullname || nextPodcast.username}</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-yellow-500 mb-4">{countdown}s</div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setShowNextCountdown(false);
                                        setCountdown(5);
                                        hasNavigatedToNext.current = false;
                                    }}
                                    className="px-4 py-2 rounded bg-gray-300 text-black font-semibold hover:bg-gray-400 transition"
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
                                    className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                                >
                                    Xem ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls container */}
                <div className={`absolute bottom-0 left-0 transition-opacity duration-300 right-0 px-2 pb-4 md:px-6 md:pb-6  ${showControls ? "opacity-100" : "opacity-0"}`}>
                    {/* Progress bar */}
                    <div
                        className={`mb-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                            }`}
                    >
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
                                background: `linear-gradient(to right,rgb(250, 190, 24) ${(
                                    (currentTime / duration) *
                                    100
                                ).toFixed(2)}%, rgba(255,255,255,0.3) 0%)`,
                            }}
                        />
                        {hoverTime !== null && (
                            <div
                                className="absolute bg-black/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs rounded-lg shadow-xl"
                                style={{
                                    left: `${(hoverTime / duration) * 100}%`,
                                    transform: "translateX(-50%)",
                                }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}
                    </div>

                    {/* Responsive: Play/Pause/Prev/Next controls OUTSIDE menu bar on mobile */}
                    <div className={`flex md:hidden justify-center items-center space-x-4 mb-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
                        <Tooltip text="Rewind 10s">
                            <button
                                onClick={() =>
                                    videoRef.current &&
                                    (videoRef.current.currentTime -= 10)
                                }
                                className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                            >
                                <BiLeftArrow className="w-5 h-5" />
                            </button>
                        </Tooltip>
                        <button
                            onClick={handlePlayPause}
                            className="w-12 h-12 flex justify-center items-center rounded-full bg-white/90 hover:bg-white text-yellow-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            {isPlaying ? (
                                <BiPause className="w-6 h-6" />
                            ) : (
                                <BiPlay className="w-6 h-6 ml-1" />
                            )}
                        </button>
                        <Tooltip text="Forward 10s">
                            <button
                                onClick={() =>
                                    videoRef.current &&
                                    (videoRef.current.currentTime += 10)
                                }
                                className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                            >
                                <BiRightArrow className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    </div>

                    {/* Responsive menu bar */}
                    <div className="block md:hidden mb-2">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="p-2 rounded-full bg-black/60 text-yellow-400 border border-yellow-400 focus:outline-none"
                            aria-label="Open controls menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div
                        className={`
                            transition-opacity duration-300
                            ${showControls ? "opacity-100" : "opacity-0"}
                            ${menuOpen ? "block" : "hidden"} 
                            md:flex md:items-center md:space-x-4 md:opacity-100 md:relative md:bottom-0
                            flex-col md:flex-row
                            bg-black/80 md:bg-transparent rounded-lg md:rounded-none p-3 md:p-0
                            absolute md:static left-1/2 md:left-0 bottom-16 md:bottom-0 transform md:transform-none -translate-x-1/2 md:translate-x-0 z-40
                        `}
                        style={{
                            minWidth: 0,
                        }}
                    >
                        {/* On mobile, hide play/pause/prev/next in menu bar */}
                        <div className="hidden md:flex flex-row items-center space-x-2 md:space-x-4 w-full">
                            <Tooltip text="Rewind 10s">
                                <button
                                    onClick={() =>
                                        videoRef.current &&
                                        (videoRef.current.currentTime -= 10)
                                    }
                                    className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    <BiLeftArrow className="w-5 h-5" />
                                </button>
                            </Tooltip>

                            <button
                                onClick={handlePlayPause}
                                className="w-12 h-12 flex justify-center items-center rounded-full bg-white/90 hover:bg-white text-yellow-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                {isPlaying ? (
                                    <BiPause className="w-6 h-6" />
                                ) : (
                                    <BiPlay className="w-6 h-6 ml-1" />
                                )}
                            </button>

                            <Tooltip text="Forward 10s">
                                <button
                                    onClick={() =>
                                        videoRef.current &&
                                        (videoRef.current.currentTime += 10)
                                    }
                                    className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    <BiRightArrow className="w-5 h-5" />
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
                                        className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                                    >
                                        <MdSkipNext className="w-5 h-5" />
                                    </button>
                                </Tooltip>
                            )}


                            <div className="text-white text-sm font-semibold px-2 select-none flex items-center">
                                <select
                                    value={playbackRate}
                                    onChange={handleSpeedSelect}
                                    className="bg-black/60 text-white rounded px-2 py-1 border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    style={{ minWidth: 60 }}
                                >
                                    {SPEEDS.map((speed) => (
                                        <option key={speed} value={speed}>
                                            {speed}x
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <Tooltip text="Tăng tốc độ">
                                <button
                                    onClick={handleSpeedUp}
                                    className={`p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200 ${playbackRate >= SPEEDS[SPEEDS.length - 1] ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    disabled={playbackRate >= SPEEDS[SPEEDS.length - 1]}
                                >
                                    <span className="font-bold text-lg">+</span>
                                </button>
                            </Tooltip> */}
                        </div>
                        {/* On mobile, only show speed controls and others in menu bar */}
                        <div className="flex flex-row items-center space-x-2 md:space-x-4 w-full mt-2 md:mt-0">
                            {/* Speed Down Button (mobile) */}
                            <Tooltip text="Giảm tốc độ">
                                <button
                                    onClick={handleSpeedDown}
                                    className={`p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200 ${playbackRate <= SPEEDS[0] ? "opacity-50 cursor-not-allowed" : ""
                                        } md:hidden`}
                                    disabled={playbackRate <= SPEEDS[0]}
                                >
                                    <span className="font-bold text-lg">-</span>
                                </button>
                            </Tooltip>
                            {/* Speed Select Dropdown (mobile) */}
                            <div className="text-white text-sm font-semibold px-2 select-none flex items-center md:hidden">
                                <select
                                    value={playbackRate}
                                    onChange={handleSpeedSelect}
                                    className="bg-black/60 text-white rounded px-2 py-1 border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    style={{ minWidth: 60 }}
                                >
                                    {SPEEDS.map((speed) => (
                                        <option key={speed} value={speed}>
                                            {speed}x
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Speed Up Button (mobile) */}
                            <Tooltip text="Tăng tốc độ">
                                <button
                                    onClick={handleSpeedUp}
                                    className={`p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200 ${playbackRate >= SPEEDS[SPEEDS.length - 1] ? "opacity-50 cursor-not-allowed" : ""
                                        } md:hidden`}
                                    disabled={playbackRate >= SPEEDS[SPEEDS.length - 1]}
                                >
                                    <span className="font-bold text-lg">+</span>
                                </button>
                            </Tooltip>
                            {/* Volume and time always visible */}
                            <div className="flex items-center space-x-2">
                                {audioLevel === 0 ? (
                                    <BsVolumeMute
                                        className="text-white w-5 h-5"
                                        onClick={() =>
                                            changeAudioLevel(audioLevelHistory)
                                        }
                                    />
                                ) : (
                                    <BsVolumeUp
                                        className="text-white w-5 h-5"
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
                                    className="w-20 h-1.5 rounded-lg cursor-pointer appearance-none"
                                    style={{
                                        background: `linear-gradient(to right,rgb(250, 190, 24) ${audioLevel * 100
                                            }%, rgba(255,255,255,0.3) 0%)`,
                                    }}
                                />
                            </div>
                            <div
                                className={`left-4 text-white text-sm rounded-full shadow-lg transition-all duration-300 bottom-2`}
                            >
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                        <div className="flex flex-row items-center space-x-2 md:space-x-4 w-full mt-2 md:mt-0">
                            {/* Transcript list toggle button */}
                            <Tooltip text={showTranscript ? "Ẩn transcript" : "Xem transcript"}>
                                <button
                                    onClick={() => setShowTranscript((v) => !v)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-yellow-400 text-yellow-400 bg-black/40 hover:bg-yellow-400 hover:text-black transition-all duration-200`}
                                >
                                    {showTranscript ? "Ẩn transcript" : "Xem transcript"}
                                </button>
                            </Tooltip>
                            {/* CC (black overlay) toggle button */}
                            <Tooltip text={showCC ? "Ẩn CC" : "Hiện CC"}>
                                <button
                                    onClick={() => setShowCC((v) => !v)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-yellow-400 text-yellow-400 bg-black/40 hover:bg-yellow-400 hover:text-black transition-all duration-200`}
                                >
                                    {showCC ? "Ẩn CC" : "Hiện CC"}
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Fullscreen Button */}
                <div
                    className={`absolute bottom-6 right-6 z-50 ${showControls ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <Tooltip
                        text={
                            isFullscreen
                                ? "Exit fullscreen"
                                : "Enter fullscreen"
                        }
                    >
                        <button
                            onClick={handleFullscreenToggle}
                            className="p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
                        >
                            {isFullscreen ? (
                                <MdOutlineZoomInMap className="w-5 h-5" />
                            ) : (
                                <MdOutlineZoomOutMap className="w-5 h-5" />
                            )}
                        </button>
                    </Tooltip>
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
                message={"Chúng tôi nhận thấy bạn đã xem video này đến " + formatTimeFromSeconds(videoTracking?.pauseTime) + ". Bạn có muốn tiếp tục xem không?"}
                isOpen={showConfirmBox}
                onConfirm={() => {
                    setShowConfirmBox(false);
                    // Continue video
                    if (videoRef.current && videoTracking) {
                        videoRef.current.currentTime = videoTracking.pauseTime;
                        setCurrentTime(videoTracking.pauseTime);
                        videoRef.current.play();
                    }
                    // Handle confirm action here
                }}
                onCancel={() => {
                    setShowConfirmBox(false)
                    if (videoRef.current)
                        videoRef.current.currentTime = 0;

                }}
                confirmText="Yes"
                cancelText="No"
            />
        </div>
    );
};

export default CustomPodcastVideo;
