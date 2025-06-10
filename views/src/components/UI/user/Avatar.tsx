import { UserFrame } from "../../../models/User"
import defaultAvatar from "../../../assets/images/default_avatar.jpg"
interface AvatarProps {
    avatarUrl?: string
    alt?: string
    usedFrame?:UserFrame
    width?: string
    height?: string
    username?:string
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onError?: (e:any) => void
}
const Avatar: React.FC<AvatarProps> = ({ avatarUrl,alt, width, height, usedFrame,onClick,onError}) => {
    return (
        <div className="relative" onClick={onClick}>
    <img 
        src={avatarUrl ? avatarUrl : defaultAvatar} 
        alt={alt ? alt : "avatar"}
        onError={onError}
        className={`rounded-full ring-2 ring-gray-200 dark:ring-gray-700 ${width} ${height} object-cover`}
    />
    {usedFrame && (
        <img 
            src={usedFrame.imageURL} 
            alt={usedFrame.name} 
            className="absolute inset-0 object-contain scale-[1.2] pointer-events-none"
        />
    )}
</div>

    )
}

export default Avatar
