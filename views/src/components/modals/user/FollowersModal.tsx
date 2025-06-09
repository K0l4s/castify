import { useEffect, useState } from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import { userCard } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { useNavigate } from 'react-router-dom';
interface FollowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
}
const FollowersModal = (props: FollowersModalProps) => {
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [pageNumber] = useState(0);
    const navigate = useNavigate();
    // const [totalPages, setTotalPages] = useState(0);
    const pageSize = 2;
    useEffect(() => {
        const fetchFollowers = async () => {
            const response: any = await userService.getFollowers(props.username, pageNumber, pageSize);
            setFollowers(response.data.data);
            // setTotalPages(response.data.totalPages);
            // console.log(response.data);
        };
        if (props.isOpen) {
            fetchFollowers();
            console.log(followers);
        }
    }, [props.isOpen]);
    const handleFollow = async (username: string) => {
        try {
            const response = await userService.followUser(username);
            if (response.status === 200) {
                setFollowers((prevFollowers) =>
                    prevFollowers.map((follower) =>
                        follower.username === username ? { ...follower, follow: !follower.follow } : follower
                    )
                );
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    }
    return (
        <CustomModal isOpen={props.isOpen} onClose={props.onClose} title='Followers' size='md' animation='fade' closeOnEsc={true} closeOnOutsideClick={true}>
            <div className="p-4">
                {followers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between py-2 border-b border-gray-200"
                        onClick={() => {
                            navigate(`/profile/${follower.username}`)
                            props.onClose();
                        }
                        } >
                        <div className="flex items-center cursor-pointer">
                            <img src={follower.avatarUrl} alt={follower.fullname} className="w-8 h-8 rounded-full" />
                            <span className="ml-2 font-semibold">{follower.fullname}</span>
                        </div>
                        <button
                            className={`px-4 py-1 text-sm ${follower.follow ? 'text-white bg-blue-500' : 'text-blue-500 border border-blue-500'} rounded-md`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(follower.username);
                            }}
                        >
                            {follower.follow ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
        </CustomModal>
    )
}

export default FollowersModal