import { UserFrame } from "../../../models/User"

interface AvatarProps {
    avatarUrl: string
    alt?: string
    usedFrame?:UserFrame
    width?: string
    height?: string
}
const Avatar: React.FC<AvatarProps> = ({ avatarUrl,alt, width, height, usedFrame}) => {
    return (
        <div className="relative">
            <img 
                src={avatarUrl} 
                alt={alt ? alt : "avatar"}
                className={`rounded-full ring-2 ring-gray-200 dark:ring-gray-700 ${width} ${height} object-cover`}
            />
            {usedFrame && <img src={usedFrame.imageURL} alt={usedFrame.name} className="absolute inset-0 w-full h-full object-contain" />}
        </div>
    )
}

export default Avatar
