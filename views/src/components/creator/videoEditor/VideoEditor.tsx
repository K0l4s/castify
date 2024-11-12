import { useState, useRef, useEffect } from 'react'
import { FaScissors, FaPlay, FaPause } from 'react-icons/fa6';

interface VideoClip {
    id: string;
    startTime: number;
    endTime: number;
    src: string;
    duration: number;
}

interface TextOverlay {
    id: string;
    text: string;
    position: {x: number; y: number};
    style: {
        fontSize: number;
        color: string;
        fontFamily: string;
    }
}

// interface AudioTrack {
//     id: string;
//     src: string;
//     startTime: number;
//     volume: number;
// }

const VideoEditor = () => {
    const [videoClips, setVideoClips] = useState<VideoClip[]>([])
    const [selectedClip, setSelectedClip] = useState<string | null>(null)
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
    // const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
    const [selectedText, setSelectedText] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [showSplitLine, setShowSplitLine] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [timelineScale, setTimelineScale] = useState(1)
    const [editingText, setEditingText] = useState<string | null>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            const video = document.createElement('video')
            video.src = url
            
            video.onloadedmetadata = () => {
                const newClip: VideoClip = {
                    id: Date.now().toString(),
                    startTime: 0,
                    endTime: video.duration,
                    duration: video.duration,
                    src: url
                }
                setVideoClips(prevClips => [...prevClips, newClip])
                
                if (videoRef.current) {
                    videoRef.current.src = url
                    videoRef.current.load()
                }
            }
        }
    }

    const handleAddText = () => {
        const newText: TextOverlay = {
            id: Date.now().toString(),
            text: 'Click to edit',
            position: {x: 50, y: 50},
            style: {
                fontSize: 24,
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        }
        setTextOverlays([...textOverlays, newText])
        setSelectedText(newText.id)
        setEditingText(newText.id)
    }

    const handleTextDragStart = (id: string) => {
        if (editingText) return
        setSelectedText(id)
        setIsDragging(true)
    }

    const handleTextDrag = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        if (isDragging && selectedText === id && !editingText) {
            const container = e.currentTarget.parentElement
            if (!container) return

            const rect = container.getBoundingClientRect()
            let clientX: number, clientY: number

            if ('touches' in e) {
                const touch = e.touches[0]
                clientX = touch.clientX
                clientY = touch.clientY
            } else {
                clientX = e.clientX
                clientY = e.clientY
            }

            const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
            const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
            
            setTextOverlays(overlays => 
                overlays.map(overlay => 
                    overlay.id === id 
                        ? {...overlay, position: {x, y}}
                        : overlay
                )
            )
        }
    }

    const handleTextDragEnd = () => {
        setIsDragging(false)
    }

    const handleTextClick = (id: string) => {
        if (!isDragging) {
            setEditingText(id)
            setSelectedText(id)
        }
    }

    const handleTextChange = (id: string, newText: string) => {
        setTextOverlays(overlays =>
            overlays.map(overlay =>
                overlay.id === id
                    ? {...overlay, text: newText}
                    : overlay
            )
        )
    }

    const handleTextBlur = () => {
        setEditingText(null)
    }

    // const handleClipTrim = (id: string, startTime: number, endTime: number) => {
    //     setVideoClips(clips =>
    //         clips.map(clip =>
    //             clip.id === id
    //                 ? {...clip, startTime, endTime}
    //                 : clip
    //         )
    //     )
    // }

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!videoRef.current || !timelineRef.current) return
        
        const rect = timelineRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const timePosition = (clickX / rect.width) * (videoRef.current.duration / timelineScale)
        
        videoRef.current.currentTime = timePosition
        setCurrentTime(timePosition)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (timelineRef.current && showSplitLine) {
            const rect = timelineRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const timePosition = (x / rect.width) * (videoRef.current?.duration || 0)
            setMousePosition({x: timePosition, y: e.clientY - rect.top})
        }
    }

    const handleTimelineZoom = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
            setTimelineScale(prev => Math.min(Math.max(prev * zoomFactor, 0.1), 10))
        }
    }

    const handleSplitClip = () => {
        if (!selectedClip || !videoRef.current) return

        const currentClip = videoClips.find(clip => clip.id === selectedClip)
        if (!currentClip) return

        const splitTime = mousePosition.x

        const firstHalf: VideoClip = {
            id: Date.now().toString(),
            startTime: currentClip.startTime,
            endTime: splitTime,
            src: currentClip.src,
            duration: currentClip.duration
        }

        const secondHalf: VideoClip = {
            id: (Date.now() + 1).toString(),
            startTime: splitTime,
            endTime: currentClip.endTime,
            src: currentClip.src,
            duration: currentClip.duration
        }

        setVideoClips(clips => {
            const index = clips.findIndex(clip => clip.id === selectedClip)
            const newClips = [...clips]
            newClips.splice(index, 1, firstHalf, secondHalf)
            return newClips
        })
        setShowSplitLine(false)
    }

    const handleDeleteClip = () => {
        if (!selectedClip) return
        setVideoClips(clips => clips.filter(clip => clip.id !== selectedClip))
        setSelectedClip(null)
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

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 's' && selectedClip && showSplitLine) {
                handleSplitClip()
            }
            if ((e.key === 'Delete' || e.key === 'Del') && selectedClip) {
                handleDeleteClip()
            }
            if (e.key === ' ') {
                e.preventDefault()
                togglePlayPause()
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [selectedClip, mousePosition, showSplitLine, isPlaying])

    useEffect(() => {
        if (!videoRef.current || videoClips.length === 0) return

        const firstClip = videoClips[0]
        if (videoRef.current.src !== firstClip.src) {
            videoRef.current.src = firstClip.src
            videoRef.current.load()
        }
        videoRef.current.currentTime = currentTime
    }, [currentTime, videoClips])

    useEffect(() => {
        if (videoClips.length > 0 && videoRef.current) {
            const firstClip = videoClips[0]
            videoRef.current.src = firstClip.src
            videoRef.current.load()
        }
    }, [videoClips])

    const handleExport = async () => {
        if (!videoRef.current || videoClips.length === 0) {
            console.error('No video to export')
            return
        }

        try {
            // Create a canvas element to draw the video frames
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Could not get canvas context')

            // Set canvas dimensions to match video
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight

            // Create MediaRecorder to record canvas
            const stream = canvas.captureStream(30) // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            })

            const chunks: Blob[] = []
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'exported-video.webm'
                a.click()
                URL.revokeObjectURL(url)
            }

            // Start recording
            mediaRecorder.start()

            // Process each clip
            for (const clip of videoClips) {
                videoRef.current.currentTime = clip.startTime
                
                // Wait for video to seek
                await new Promise(resolve => {
                    videoRef.current!.onseeked = resolve
                })

                // Draw frames for clip duration
                // const startTime = performance.now()
                // const clipDuration = clip.endTime - clip.startTime
                
                while (videoRef.current.currentTime < clip.endTime) {
                    ctx.drawImage(videoRef.current, 0, 0)
                    
                    // Draw text overlays
                    textOverlays.forEach(overlay => {
                        ctx.font = `${overlay.style.fontSize}px ${overlay.style.fontFamily}`
                        ctx.fillStyle = overlay.style.color
                        ctx.textAlign = 'center'
                        const x = (overlay.position.x / 100) * canvas.width
                        const y = (overlay.position.y / 100) * canvas.height
                        ctx.fillText(overlay.text, x, y)
                    })

                    videoRef.current.currentTime += 1/30 // Advance 1 frame at 30fps
                    await new Promise(resolve => setTimeout(resolve, 1000/30))
                }
            }

            // Stop recording
            mediaRecorder.stop()

        } catch (error) {
            console.error('Error exporting video:', error)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="flex-1 flex">
                <div className="w-3/4 p-4">
                    <div className="bg-black aspect-video mb-4 relative">
                        <input 
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            style={{display: videoClips.length === 0 ? 'block' : 'none'}}
                        />
                        {videoClips.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-400">Drop video file here or click to upload</p>
                            </div>
                        )}
                        {videoClips.length > 0 && (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full"
                                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                                />
                                <button
                                    onClick={togglePlayPause}
                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 rounded-full p-3"
                                >
                                    {isPlaying ? <FaPause /> : <FaPlay />}
                                </button>
                            </>
                        )}
                        {textOverlays.map(overlay => (
                            <div
                                key={overlay.id}
                                style={{
                                    position: 'absolute',
                                    left: `${overlay.position.x}%`,
                                    top: `${overlay.position.y}%`,
                                    cursor: isDragging && selectedText === overlay.id ? 'grabbing' : 'grab',
                                    userSelect: 'none',
                                    transform: 'translate(-50%, -50%)',
                                    ...overlay.style
                                }}
                                onMouseDown={() => handleTextDragStart(overlay.id)}
                                onMouseUp={handleTextDragEnd}
                                onMouseMove={(e) => handleTextDrag(e, overlay.id)}
                                onTouchStart={() => handleTextDragStart(overlay.id)}
                                onTouchEnd={handleTextDragEnd}
                                onTouchMove={(e) => handleTextDrag(e, overlay.id)}
                                onClick={() => handleTextClick(overlay.id)}
                            >
                                {editingText === overlay.id ? (
                                    <input
                                        type="text"
                                        value={overlay.text}
                                        onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                                        onBlur={handleTextBlur}
                                        autoFocus
                                        className="bg-transparent border-b border-white outline-none text-center"
                                        style={{
                                            fontSize: `${overlay.style.fontSize}px`,
                                            color: overlay.style.color,
                                            width: '200px'
                                        }}
                                    />
                                ) : (
                                    overlay.text
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div 
                        ref={timelineRef}
                        className="bg-gray-800 p-4 rounded relative cursor-pointer"
                        onMouseMove={handleMouseMove}
                        onClick={handleTimelineClick}
                        onWheel={handleTimelineZoom}
                    >
                        <div className="flex space-x-2 mb-4" style={{transform: `scaleX(${timelineScale})`, transformOrigin: 'left'}}>
                            {videoClips.map(clip => (
                                <div
                                    key={clip.id}
                                    className={`relative h-16 bg-blue-500 rounded p-2 cursor-pointer ${
                                        selectedClip === clip.id ? 'ring-2 ring-white' : ''
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedClip(clip.id)
                                    }}
                                    style={{width: `${((clip.endTime - clip.startTime) / clip.duration) * 100}%`}}
                                >
                                    <span className="text-xs">Clip {clip.id}</span>
                                </div>
                            ))}
                        </div>
                        {showSplitLine && selectedClip && (
                            <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                style={{
                                    left: `${(mousePosition.x / (videoRef.current?.duration || 1)) * 100}%`,
                                    display: mousePosition.x > 0 ? 'block' : 'none'
                                }}
                            />
                        )}
                        <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-white"
                            style={{
                                left: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%`,
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                </div>

                <div className="w-1/4 bg-gray-800 p-4">
                    <h2 className="text-xl font-bold mb-4">Tools</h2>
                    <div className="space-y-4">
                        <div className="border-b border-gray-700 pb-4">
                            <h3 className="text-sm font-semibold mb-2">Video Tools</h3>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileUpload}
                                className="w-full mb-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                            />
                            <button
                                onClick={() => setShowSplitLine(!showSplitLine)}
                                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded mb-2 ${
                                    showSplitLine ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                disabled={!selectedClip}
                            >
                                <FaScissors />
                                <span>{showSplitLine ? 'Cancel Split' : 'Split Video'}</span>
                            </button>
                            {showSplitLine && (
                                <p className="text-xs text-gray-400 text-center">Press 'S' to split at the red line</p>
                            )}
                            <button
                                onClick={handleDeleteClip}
                                className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded mb-2"
                                disabled={!selectedClip}
                            >
                                Delete Clip
                            </button>
                            {selectedClip && (
                                <p className="text-xs text-gray-400 text-center">Press Delete to remove selected clip</p>
                            )}
                        </div>

                        <div className="border-b border-gray-700 pb-4">
                            <h3 className="text-sm font-semibold mb-2">Text Tools</h3>
                            <button
                                onClick={handleAddText}
                                className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mb-2"
                            >
                                Add Text
                            </button>
                            {selectedText && (
                                <div className="space-y-2">
                                    <input
                                        type="color"
                                        className="w-full h-8 rounded"
                                        onChange={(e) => {
                                            setTextOverlays(overlays =>
                                                overlays.map(overlay =>
                                                    overlay.id === selectedText
                                                        ? {...overlay, style: {...overlay.style, color: e.target.value}}
                                                        : overlay
                                                )
                                            )
                                        }}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="12"
                                            max="72"
                                            className="flex-1"
                                            onChange={(e) => {
                                                setTextOverlays(overlays =>
                                                    overlays.map(overlay =>
                                                        overlay.id === selectedText
                                                            ? {...overlay, style: {...overlay.style, fontSize: parseInt(e.target.value)}}
                                                            : overlay
                                                    )
                                                )
                                            }}
                                        />
                                        <span className="text-sm">
                                            {textOverlays.find(o => o.id === selectedText)?.style.fontSize}px
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2">Export</h3>
                            <button
                                onClick={handleExport}
                                className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                            >
                                Export Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoEditor
