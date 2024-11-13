import { useState, useRef, useEffect } from 'react'
import { FaImage, FaMusic, FaVideo } from 'react-icons/fa6';

interface VideoClip {
    id: string;
    startTime: number;
    endTime: number;
    src: string;
    duration: number;
    volume: number;
}

interface AudioClip {
    id: string;
    startTime: number;
    endTime: number;
    src: string;
    duration: number;
    volume: number;
}

interface TextOverlay {
    id: string;
    text: string;
    position: {x: number; y: number};
    startTime: number;
    endTime: number;
    style: {
        fontSize: number;
        color: string;
        fontFamily: string;
    }
}

interface ImageOverlay {
    id: string;
    src: string;
    position: {x: number; y: number};
    startTime: number;
    endTime: number;
    scale: number;
}

interface StoredComponent {
    id: string;
    type: 'video' | 'audio' | 'image';
    name: string;
    src: string;
    createdAt: Date;
}

const VideoEditor = () => {
    const [videoClips, setVideoClips] = useState<VideoClip[]>([])
    const [audioClips, setAudioClips] = useState<AudioClip[]>([])
    const [selectedClip, setSelectedClip] = useState<string | null>(null)
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
    const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([])
    const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)
    console.log(selectedOverlay)    
    // const [isDragging, setIsDragging] = useState(false)
    // const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    // const [showSplitLine, setShowSplitLine] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    // const [timelineScale, setTimelineScale] = useState(1)
    // const [editingText, setEditingText] = useState<string | null>(null)
    const [storedComponents, setStoredComponents] = useState<StoredComponent[]>([])
    const [showComponentLibrary, setShowComponentLibrary] = useState(false)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'image') => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        const newComponent: StoredComponent = {
            id: Date.now().toString(),
            type,
            name: file.name,
            src: url,
            createdAt: new Date()
        }
        setStoredComponents(prev => [...prev, newComponent])

        if (type === 'video') {
            const video = document.createElement('video')
            video.src = url
            video.onloadedmetadata = () => {
                const newClip: VideoClip = {
                    id: Date.now().toString(),
                    startTime: 0,
                    endTime: video.duration,
                    duration: video.duration,
                    src: url,
                    volume: 1
                }
                setVideoClips(prevClips => [...prevClips, newClip])
            }
        } else if (type === 'audio') {
            const audio = new Audio(url)
            audio.onloadedmetadata = () => {
                const newClip: AudioClip = {
                    id: Date.now().toString(),
                    startTime: 0,
                    endTime: audio.duration,
                    duration: audio.duration,
                    src: url,
                    volume: 1
                }
                setAudioClips(prevClips => [...prevClips, newClip])
            }
        } else if (type === 'image') {
            const newImage: ImageOverlay = {
                id: Date.now().toString(),
                src: url,
                position: { x: 50, y: 50 },
                startTime: currentTime,
                endTime: currentTime + 5,
                scale: 1
            }
            setImageOverlays(prev => [...prev, newImage])
        }
    }

    useEffect(() => {
        const handleTimeUpdate = () => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime)
            }
        }

        videoRef.current?.addEventListener('timeupdate', handleTimeUpdate)
        return () => videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate)
    }, [])

    const handleSplitClip = () => {
        if (!selectedClip || !videoRef.current) return

        const clip = videoClips.find(c => c.id === selectedClip)
        if (!clip) return

        const splitTime = videoRef.current.currentTime
        
        const clip1: VideoClip = {
            ...clip,
            id: Date.now().toString(),
            endTime: splitTime,
            duration: splitTime - clip.startTime
        }

        const clip2: VideoClip = {
            ...clip,
            id: (Date.now() + 1).toString(),
            startTime: splitTime,
            duration: clip.endTime - splitTime
        }

        setVideoClips(prev => 
            prev.filter(c => c.id !== selectedClip).concat([clip1, clip2])
        )
    }

    const handleAddText = () => {
        const newText: TextOverlay = {
            id: Date.now().toString(),
            text: 'New Text',
            position: { x: 50, y: 50 },
            startTime: currentTime,
            endTime: currentTime + 5,
            style: {
                fontSize: 24,
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        }
        setTextOverlays(prev => [...prev, newText])
    }

    // const handleOverlayDrag = (id: string, type: 'text' | 'image', newPosition: {x: number, y: number}) => {
    //     if (type === 'text') {
    //         setTextOverlays(prev => 
    //             prev.map(overlay => 
    //                 overlay.id === id 
    //                     ? {...overlay, position: newPosition}
    //                     : overlay
    //             )
    //         )
    //     } else {
    //         setImageOverlays(prev => 
    //             prev.map(overlay => 
    //                 overlay.id === id 
    //                     ? {...overlay, position: newPosition}
    //                     : overlay
    //             )
    //         )
    //     }
    // }

    // const handleTextEdit = (id: string, newText: string) => {
    //     setTextOverlays(prev => 
    //         prev.map(overlay => 
    //             overlay.id === id 
    //                 ? {...overlay, text: newText}
    //                 : overlay
    //         )
    //     )
    // }

    // const handleVolumeChange = (id: string, type: 'video' | 'audio', volume: number) => {
    //     if (type === 'video') {
    //         setVideoClips(prev =>
    //             prev.map(clip =>
    //                 clip.id === id
    //                     ? {...clip, volume}
    //                     : clip
    //             )
    //         )
    //     } else {
    //         setAudioClips(prev =>
    //             prev.map(clip =>
    //                 clip.id === id
    //                     ? {...clip, volume}
    //                     : clip
    //             )
    //         )
    //     }
    // }

    // const handleTimelineItemDrag = (id: string, type: 'video' | 'audio' | 'text' | 'image', newStartTime: number) => {
    //     if (type === 'video') {
    //         setVideoClips(prev =>
    //             prev.map(clip => {
    //                 if (clip.id === id) {
    //                     const duration = clip.endTime - clip.startTime
    //                     return {
    //                         ...clip,
    //                         startTime: newStartTime,
    //                         endTime: newStartTime + duration
    //                     }
    //                 }
    //                 return clip
    //             })
    //         )
    //     } else if (type === 'audio') {
    //         setAudioClips(prev =>
    //             prev.map(clip => {
    //                 if (clip.id === id) {
    //                     const duration = clip.endTime - clip.startTime
    //                     return {
    //                         ...clip,
    //                         startTime: newStartTime,
    //                         endTime: newStartTime + duration
    //                     }
    //                 }
    //                 return clip
    //             })
    //         )
    //     } else if (type === 'text') {
    //         setTextOverlays(prev =>
    //             prev.map(overlay => {
    //                 if (overlay.id === id) {
    //                     const duration = overlay.endTime - overlay.startTime
    //                     return {
    //                         ...overlay,
    //                         startTime: newStartTime,
    //                         endTime: newStartTime + duration
    //                     }
    //                 }
    //                 return overlay
    //             })
    //         )
    //     } else {
    //         setImageOverlays(prev =>
    //             prev.map(overlay => {
    //                 if (overlay.id === id) {
    //                     const duration = overlay.endTime - overlay.startTime
    //                     return {
    //                         ...overlay,
    //                         startTime: newStartTime,
    //                         endTime: newStartTime + duration
    //                     }
    //                 }
    //                 return overlay
    //             })
    //         )
    //     }
    // }

    const handleComponentSelect = (component: StoredComponent) => {
        if (component.type === 'video') {
            const video = document.createElement('video')
            video.src = component.src
            video.onloadedmetadata = () => {
                const newClip: VideoClip = {
                    id: Date.now().toString(),
                    startTime: currentTime,
                    endTime: currentTime + video.duration,
                    duration: video.duration,
                    src: component.src,
                    volume: 1
                }
                setVideoClips(prev => [...prev, newClip])
            }
        } else if (component.type === 'audio') {
            const audio = new Audio(component.src)
            audio.onloadedmetadata = () => {
                const newClip: AudioClip = {
                    id: Date.now().toString(),
                    startTime: currentTime,
                    endTime: currentTime + audio.duration,
                    duration: audio.duration,
                    src: component.src,
                    volume: 1
                }
                setAudioClips(prev => [...prev, newClip])
            }
        } else if (component.type === 'image') {
            const newImage: ImageOverlay = {
                id: Date.now().toString(),
                src: component.src,
                position: { x: 50, y: 50 },
                startTime: currentTime,
                endTime: currentTime + 5,
                scale: 1
            }
            setImageOverlays(prev => [...prev, newImage])
        }
    }

    const handleDeleteComponent = (id: string) => {
        setStoredComponents(prev => prev.filter(component => component.id !== id))
    }

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current || !videoRef.current) return

        const rect = timelineRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const timelineWidth = rect.width
        const duration = videoRef.current.duration

        const newTime = (clickX / timelineWidth) * duration
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const togglePlayPause = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="flex-1 flex">
                <div className="w-3/4 p-4">
                    <div className="relative aspect-video bg-black mb-4">
                        <video
                            ref={videoRef}
                            className="w-full h-full"
                            onClick={togglePlayPause}
                        />
                        {textOverlays.map(overlay => (
                            currentTime >= overlay.startTime && currentTime <= overlay.endTime && (
                                <div
                                    key={overlay.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${overlay.position.x}%`,
                                        top: `${overlay.position.y}%`,
                                        ...overlay.style
                                    }}
                                    onMouseDown={() => setSelectedOverlay(overlay.id)}
                                >
                                    {overlay.text}
                                </div>
                            )
                        ))}
                        {imageOverlays.map(overlay => (
                            currentTime >= overlay.startTime && currentTime <= overlay.endTime && (
                                <img
                                    key={overlay.id}
                                    src={overlay.src}
                                    style={{
                                        position: 'absolute',
                                        left: `${overlay.position.x}%`,
                                        top: `${overlay.position.y}%`,
                                        transform: `scale(${overlay.scale})`
                                    }}
                                    onMouseDown={() => setSelectedOverlay(overlay.id)}
                                />
                            )
                        ))}
                    </div>

                    <div 
                        ref={timelineRef}
                        className="h-32 bg-gray-800 relative"
                        onClick={handleTimelineClick}
                    >
                        {/* Timeline components rendering */}
                        <div className="absolute top-0 left-0 w-full h-full">
                            {videoClips.map(clip => (
                                <div
                                    key={clip.id}
                                    className={`absolute h-8 bg-blue-500 ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                                    style={{
                                        left: `${(clip.startTime / (videoRef.current?.duration || 1)) * 100}%`,
                                        width: `${((clip.endTime - clip.startTime) / (videoRef.current?.duration || 1)) * 100}%`
                                    }}
                                    onClick={() => setSelectedClip(clip.id)}
                                />
                            ))}
                            {audioClips.map(clip => (
                                <div
                                    key={clip.id}
                                    className="absolute h-6 bg-green-500 top-10"
                                    style={{
                                        left: `${(clip.startTime / (videoRef.current?.duration || 1)) * 100}%`,
                                        width: `${((clip.endTime - clip.startTime) / (videoRef.current?.duration || 1)) * 100}%`
                                    }}
                                />
                            ))}
                            <div
                                className="absolute h-full w-0.5 bg-red-500"
                                style={{
                                    left: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-1/4 bg-gray-800 p-4">
                    <h2 className="text-xl font-bold mb-4">Tools</h2>
                    <div className="space-y-4">
                        <div className="border-b border-gray-700 pb-4">
                            <h3 className="text-sm font-semibold mb-2">Component Library</h3>
                            <button
                                onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                                className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mb-2"
                            >
                                {showComponentLibrary ? 'Hide Library' : 'Show Library'}
                            </button>

                            {showComponentLibrary && (
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <label className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded cursor-pointer">
                                            <FaVideo className="mr-2" />
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                                className="hidden"
                                            />
                                            Video
                                        </label>
                                        <label className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded cursor-pointer">
                                            <FaMusic className="mr-2" />
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => handleFileUpload(e, 'audio')}
                                                className="hidden"
                                            />
                                            Audio
                                        </label>
                                        <label className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded cursor-pointer">
                                            <FaImage className="mr-2" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'image')}
                                                className="hidden"
                                            />
                                            Image
                                        </label>
                                    </div>

                                    <div className="max-h-48 overflow-y-auto">
                                        {storedComponents.map(component => (
                                            <div 
                                                key={component.id}
                                                className="flex items-center justify-between bg-gray-700 p-2 rounded mb-2"
                                            >
                                                <div className="flex items-center">
                                                    {component.type === 'video' && <FaVideo className="mr-2" />}
                                                    {component.type === 'audio' && <FaMusic className="mr-2" />}
                                                    {component.type === 'image' && <FaImage className="mr-2" />}
                                                    <span className="text-sm truncate">{component.name}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleComponentSelect(component)}
                                                        className="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                                    >
                                                        Use
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComponent(component.id)}
                                                        className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={handleAddText}
                                className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                            >
                                Add Text
                            </button>
                            <button
                                onClick={handleSplitClip}
                                disabled={!selectedClip}
                                className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                            >
                                Split Clip
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoEditor
