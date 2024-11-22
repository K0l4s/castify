import { useRef, useState, useEffect } from "react"
import CustomButton from "../../UI/custom/CustomButton"
import { PiPlusCircleDuotone } from "react-icons/pi"
import { BiCut, BiPlay, BiPause, BiSkipPrevious, BiSkipNext, BiVolumeFull, BiVolumeMute } from "react-icons/bi"
import { MdOutlineLoop } from "react-icons/md"
import { FiTrash2 } from "react-icons/fi"

const VideoEditor = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const componentsRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [components, setComponents] = useState<any[]>([])
    const [timelineComponents, setTimelineComponents] = useState<any[]>([])
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)
    const [currentPreviewComponent, setCurrentPreviewComponent] = useState<any>(null)
    const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [isSplitMode, setIsSplitMode] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const handleAddComponent = async () => {
        try {
            const file = await (window as any).showOpenFilePicker({
                types: [
                    {
                        description: 'Media Files',
                        accept: {
                            'video/*': ['.mp4', '.webm', '.ogg'],
                            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                            'audio/*': ['.mp3', '.wav']
                        }
                    }
                ]
            })
            if (file.length === 0) return
            const fileHandle = file[0]
            const fileData = await fileHandle.getFile()
            setComponents([...components, { type: fileData.type.split('/')[0], content: fileData }])
        } catch (error) {
            console.error('Error adding component:', error)
        }
    }

    const handleRemoveComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index))
    }

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, component: any, sourceIndex?: number) => {
        if (sourceIndex !== undefined) {
            setDraggedIndex(sourceIndex)
        }
        const componentCopy = {
            ...component,
            content: component.content,
            objectUrl: URL.createObjectURL(component.content),
            sourceIndex,
            startTime: currentTime
        }
        event.dataTransfer.setData('component', JSON.stringify(componentCopy))
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const dropZone = event.currentTarget
        const afterElement = getDragAfterElement(dropZone, event.clientX)
        const draggable = document.querySelector('.dragging')
        if (draggable && afterElement.element) {
            dropZone.insertBefore(draggable, afterElement.element)
        }
    }

    const getDragAfterElement = (container: HTMLElement, x: number): { offset: number; element: Element | null } => {
        const draggableElements = [...container.querySelectorAll('.timeline-item:not(.dragging)')]
        
        return draggableElements.reduce<{ offset: number; element: Element | null }>((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = x - box.left - box.width / 2
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null })
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const componentData = event.dataTransfer.getData('component')
        if (componentData) {
            const component = JSON.parse(componentData)
            const dropZone = event.currentTarget
            const afterElement = getDragAfterElement(dropZone, event.clientX)
            const dropIndex = afterElement.element
                ? [...dropZone.children].indexOf(afterElement.element)
                : timelineComponents.length

            if (component.sourceIndex !== undefined) {
                const newTimelineComponents = [...timelineComponents]
                const [movedComponent] = newTimelineComponents.splice(component.sourceIndex, 1)
                newTimelineComponents.splice(dropIndex, 0, movedComponent)
                setTimelineComponents(newTimelineComponents)
            } else {
                setTimelineComponents([...timelineComponents, component])
            }
        }
        setDraggedIndex(null)
    }

    const removeTimelineComponent = (index: number) => {
        setTimelineComponents(timelineComponents.filter((_, i) => i !== index))
    }

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        const milliseconds = Math.floor((time % 1) * 100)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    }

    const handleTimeUpdate = () => {
        if (videoRef.current && !isDraggingTimeline) {
            setCurrentTime(videoRef.current.currentTime)
            setDuration(videoRef.current.duration)
        }
    }

    const handleTimelineItemClick = (component: any) => {
        setCurrentPreviewComponent(component)
    }

    const handleTimelineMouseDown = (event: React.MouseEvent) => {
        setIsDraggingTimeline(true)
        handleTimelineMouseMove(event)
    }

    const handleTimelineMouseMove = (event: React.MouseEvent) => {
        if (isDraggingTimeline && timelineRef.current && videoRef.current) {
            const rect = timelineRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const percentage = Math.min(Math.max(x / rect.width, 0), 1)
            const newTime = percentage * videoRef.current.duration
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleTimelineMouseUp = () => {
        if (isSplitMode && currentPreviewComponent) {
            handleSplit()
        }
        setIsDraggingTimeline(false)
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const toggleLoop = () => {
        if (videoRef.current) {
            videoRef.current.loop = !isLooping
            setIsLooping(!isLooping)
        }
    }

    const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(e.target.value))
    }

    const toggleSplitMode = () => {
        if (!currentPreviewComponent) {
            alert("Please select a component to split first!")
            return
        }
        setIsSplitMode(!isSplitMode)
    }

    const handleSplit = () => {
        if (!currentPreviewComponent || !videoRef.current) return

        const splitTime = currentTime
        const componentIndex = timelineComponents.findIndex(comp => comp === currentPreviewComponent)
        
        if (componentIndex === -1) return

        // Create two new components from the split
        const firstHalf = {
            ...currentPreviewComponent,
            duration: splitTime - currentPreviewComponent.startTime,
            objectUrl: URL.createObjectURL(currentPreviewComponent.content)
        }

        const secondHalf = {
            ...currentPreviewComponent,
            startTime: splitTime,
            duration: currentPreviewComponent.duration - (splitTime - currentPreviewComponent.startTime),
            objectUrl: URL.createObjectURL(currentPreviewComponent.content)
        }

        // Replace the original component with the two new halves
        const newTimelineComponents = [...timelineComponents]
        newTimelineComponents.splice(componentIndex, 1, firstHalf, secondHalf)
        setTimelineComponents(newTimelineComponents)
        setIsSplitMode(false)
    }

    const handleExport = async () => {
        if (timelineComponents.length === 0) {
            alert("Please add components to the timeline before exporting")
            return
        }

        setIsExporting(true)
        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Could not get canvas context')

            const mediaRecorder = new MediaRecorder(canvas.captureStream())
            const chunks: BlobPart[] = []

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'exported-video.webm'
                a.click()
                URL.revokeObjectURL(url)
                setIsExporting(false)
            }

            mediaRecorder.start()

            // Process each component in sequence
            for (const component of timelineComponents) {
                if (component.type === 'video') {
                    const video = document.createElement('video')
                    video.src = component.objectUrl
                    await new Promise<void>((resolve) => {
                        video.onloadedmetadata = () => {
                            canvas.width = video.videoWidth
                            canvas.height = video.videoHeight
                            resolve()
                        }
                    })
                    await new Promise<void>((resolve) => {
                        video.onended = () => resolve()
                        video.play()
                        const drawFrame = () => {
                            ctx.drawImage(video, 0, 0)
                            if (!video.ended) requestAnimationFrame(drawFrame)
                        }
                        drawFrame()
                    })
                }
            }

            mediaRecorder.stop()
        } catch (error) {
            console.error('Error exporting video:', error)
            setIsExporting(false)
            alert('Error exporting video. Please try again.')
        }
    }

    useEffect(() => {
        document.addEventListener('mouseup', handleTimelineMouseUp)
        document.addEventListener('mouseleave', handleTimelineMouseUp)
        
        return () => {
            document.removeEventListener('mouseup', handleTimelineMouseUp)
            document.removeEventListener('mouseleave', handleTimelineMouseUp)
        }
    }, [isSplitMode, currentPreviewComponent])

    return <div>
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4 gap-4">
            {/* Preview Frame */}
            <div className="flex bg-gray-800 rounded-lg p-4 min-h-[400px]">
                <div className="w-full h-full flex flex-col items-center justify-center flex-1">
                    <div className="w-full h-full flex items-center justify-center">
                        {currentPreviewComponent ? (
                            currentPreviewComponent.type === 'video' ? (
                                <video 
                                    ref={videoRef}
                                    src={currentPreviewComponent.objectUrl}
                                    onTimeUpdate={handleTimeUpdate}
                                    className="w-full h-full"
                                    style={{ transform: `scale(${zoom})` }}
                                />
                            ) : currentPreviewComponent.type === 'image' ? (
                                <img 
                                    src={currentPreviewComponent.objectUrl}
                                    className="w-full h-full object-contain"
                                    style={{ transform: `scale(${zoom})` }}
                                    alt="Preview"
                                />
                            ) : currentPreviewComponent.type === 'audio' ? (
                                <audio 
                                    src={currentPreviewComponent.objectUrl}
                                    className="w-full"
                                    controls
                                />
                            ) : (
                                <p>Unsupported media type</p>
                            )
                        ) : (
                            <p>No media selected</p>
                        )}
                    </div>
                    <div className="w-full flex items-center justify-center gap-4 mt-4">
                        <BiSkipPrevious className="w-6 h-6 cursor-pointer" />
                        <div onClick={togglePlay} className="cursor-pointer">
                            {isPlaying ? <BiPause className="w-6 h-6" /> : <BiPlay className="w-6 h-6" />}
                        </div>
                        <BiSkipNext className="w-6 h-6 cursor-pointer" />
                        <div onClick={toggleMute} className="cursor-pointer">
                            {isMuted ? <BiVolumeMute className="w-6 h-6" /> : <BiVolumeFull className="w-6 h-6" />}
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24"
                        />
                        <div onClick={toggleLoop} className={`cursor-pointer ${isLooping ? 'text-blue-500' : ''}`}>
                            <MdOutlineLoop className="w-6 h-6" />
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={zoom}
                            onChange={handleZoom}
                            className="w-24"
                        />
                        <CustomButton 
                            onClick={handleExport}
                            disabled={isExporting}
                            className={isExporting ? "opacity-50" : ""}
                        >
                            {isExporting ? "Exporting..." : "Export Video"}
                        </CustomButton>
                    </div>
                </div>
                <div
                    ref={componentsRef}
                    className="w-1/4 bg-gray-900 rounded-lg p-4 overflow-y-auto"
                >
                    <h3 className="text-lg font-semibold mb-4">Media Library</h3>
                    <CustomButton onClick={handleAddComponent}>
                        <PiPlusCircleDuotone className="w-4 h-4" /> Import Media
                    </CustomButton>
                    {components.map((component, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-lg p-4 mb-4 relative cursor-move hover:bg-gray-700 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, component)}
                        >
                            <p className="text-sm mb-2">{component.content.name}</p>
                            {(component.type === 'video' || component.type === 'video/mp4' || component.type === 'video/webm' || component.type === 'video/ogg' || component.type === 'video/quicktime') && (
                                <video src={URL.createObjectURL(component.content)} className="w-full h-auto" />
                            )}
                            {(component.type === 'image' || component.type === 'image/png' || component.type === 'image/jpeg' || component.type === 'image/gif' || component.type === 'image/webp' || component.type === 'image/svg+xml' || component.type === 'image/bmp' || component.type === 'image/tiff') && (
                                <img src={URL.createObjectURL(component.content)} className="w-full h-auto" alt={component.content.name} />
                            )}
                            {component.type === 'audio' && (
                                <audio src={URL.createObjectURL(component.content)} className="w-full" controls />
                            )}
                            <button 
                                onClick={() => handleRemoveComponent(index)} 
                                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded-full transition-all duration-200"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline Panel */}
            <div className="flex-1 bg-gray-800 rounded-lg p-4">
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                            <span className="text-sm text-gray-400">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <CustomButton 
                                onClick={toggleSplitMode}
                                className={isSplitMode ? "bg-red-500" : ""}
                            >
                                <BiCut className="w-4 h-4" /> {isSplitMode ? "Click Timeline to Split" : "Split"}
                            </CustomButton>
                            <CustomButton onClick={() => setTimelineComponents([])}>
                                <FiTrash2 className="w-4 h-4" /> Clear Timeline
                            </CustomButton>
                        </div>
                    </div>
                    <div 
                        ref={timelineRef}
                        className={`w-full ${isSplitMode ? 'bg-red-700' : 'bg-gray-700'} h-2 mt-2 mb-4 rounded-full cursor-pointer relative`}
                        onMouseDown={handleTimelineMouseDown}
                        onMouseMove={handleTimelineMouseMove}
                    >
                        <div 
                            className={`absolute h-full ${isSplitMode ? 'bg-red-500' : 'bg-blue-500'} rounded-full`}
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        <div 
                            className="absolute h-4 w-4 bg-white rounded-full -top-1"
                            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                        />
                    </div>
                    <div
                        className="flex overflow-x-auto bg-gray-700 rounded-lg p-4 min-h-[120px]"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {timelineComponents.map((component, index) => (
                            <div 
                                key={index} 
                                className={`timeline-item relative flex-shrink-0 w-32 h-20 mr-1 bg-gray-600 rounded cursor-pointer 
                                    ${draggedIndex === index ? 'dragging opacity-50' : ''}
                                    ${currentPreviewComponent === component ? 'ring-2 ring-blue-500' : ''}
                                    hover:bg-gray-500 transition-colors
                                `}
                                draggable
                                onDragStart={(e) => handleDragStart(e, component, index)}
                                onClick={() => handleTimelineItemClick(component)}
                            >
                                <button 
                                    onClick={() => removeTimelineComponent(index)} 
                                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded-full transition-all duration-200"
                                >
                                    <FiTrash2 className="w-3 h-3" />
                                </button>
                                {component.type === 'video' && (
                                    <video
                                        src={component.objectUrl}
                                        className="w-full h-full object-cover rounded"
                                    />
                                )}
                                {component.type === 'image' && (
                                    <img
                                        src={component.objectUrl}
                                        className="w-full h-full object-cover rounded"
                                        alt={component.content.name}
                                    />
                                )}
                                {component.type === 'audio' && (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-900/50">
                                        <span className="text-xs text-gray-300">Audio Track</span>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs p-1 truncate">
                                    {component.content.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default VideoEditor
