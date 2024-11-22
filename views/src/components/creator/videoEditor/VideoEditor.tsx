import { useRef, useState } from "react"
import CustomButton from "../../UI/custom/CustomButton"
import { PiPlusCircleDuotone } from "react-icons/pi"
import { BiCut } from "react-icons/bi"

const VideoEditor = () => {
    // const [editedVideo, setEditedVideo] = useState<string>('')
    const videoRef = useRef<HTMLVideoElement>(null)
    const componentsRef = useRef<HTMLDivElement>(null)
    const [components, setComponents] = useState<any[]>([])
    const [timelineComponents, setTimelineComponents] = useState<any[]>([])
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)

    const handleAddComponent = async () => {
        try {
            const file = await (window as any).showOpenFilePicker()
            if (file.length === 0) return
            const fileHandle = file[0]
            const fileData = await fileHandle.getFile()
            setComponents([...components, { type: fileData.type.split('/')[0], content: fileData }])
            console.log(components)
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
        // Create a copy of the component with a new Blob URL
        const componentCopy = {
            ...component,
            content: component.content,
            objectUrl: URL.createObjectURL(component.content),
            sourceIndex
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
                // Reordering within timeline
                const newTimelineComponents = [...timelineComponents]
                const [movedComponent] = newTimelineComponents.splice(component.sourceIndex, 1)
                newTimelineComponents.splice(dropIndex, 0, movedComponent)
                setTimelineComponents(newTimelineComponents)
            } else {
                // New component from sidebar
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
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            setDuration(videoRef.current.duration)
        }
    }

    return <div>
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4 gap-4 ">
            {/* Preview Frame */}
            <div className="flex bg-gray-800 rounded-lg p-4 min-h-[400px]">
                <div className="w-full h-full flex items-center justify-center flex-1">
                    <div className="w-full h-full flex items-center justify-center">
                        <video 
                            ref={videoRef}
                            onTimeUpdate={handleTimeUpdate}
                            className="w-full h-full"
                        >
                            <p>No video selected</p>
                        </video>
                    </div>
                </div>
                <div
                    ref={componentsRef}
                    className="w-1/4 bg-gray-900 rounded-lg p-4 overflow-y-auto"
                >
                    <h3 className="text-lg font-semibold mb-4">Components</h3>
                    <CustomButton onClick={handleAddComponent}>
                        <PiPlusCircleDuotone className="w-4 h-4" /> Add Component
                    </CustomButton>
                    {components.map((component, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-lg p-4 mb-4 relative cursor-move"
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
                            <button onClick={() => handleRemoveComponent(index)} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
                            hover:bg-gray-700 rounded-full transition-all duration-200
                            ">X</button>
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
                        <CustomButton>
                            <BiCut className="w-4 h-4" />
                        </CustomButton>
                    </div>
                    <div className="w-full bg-gray-700 h-1 mt-2 mb-4 rounded-full">
                        <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>
                    <div
                        className="flex overflow-x-auto bg-gray-700 rounded-lg p-4 min-h-[100px]"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {timelineComponents.map((component, index) => (
                            <div 
                                key={index} 
                                className={`timeline-item relative flex-shrink-0 w-32 h-20 mr-1 bg-gray-600 rounded cursor-move ${draggedIndex === index ? 'dragging' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, component, index)}
                            >
                                <button onClick={() => removeTimelineComponent(index)} className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center 
                                hover:bg-gray-700 rounded-full transition-all duration-200
                                ">X</button>
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
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xs text-gray-300">Audio</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default VideoEditor
