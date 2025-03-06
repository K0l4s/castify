interface AvatarProps {
    src: string
    width: string
    height: string
    alt?: string
    frameSrc?: string
}
const Avatar: React.FC<AvatarProps> = ({ src, width, height, alt, frameSrc }) => {
    return (
        <div className="relative">
            <img src={src} alt={
                alt ? alt : "avatar"
            } className={`rounded-full  ring-2 ring-gray-200 dark:ring-gray-700 w-${width} h-${height} object-cover`} />
            {frameSrc && <img src={frameSrc} alt="frame" className="absolute inset-0 w-full h-full object-cover" />}
        </div>
    )
}

export default Avatar