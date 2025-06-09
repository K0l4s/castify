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
const FollowingsModal = (props: FollowersModalProps) => {
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [pageNumber] = useState(0);
    const navigate = useNavigate();
    // const [setTotalPages] = useState(0);
    const pageSize = 10;
    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await userService.getFollowings(props.username, pageNumber, pageSize);
            setFollowers(response.data.data);
        };
        if (props.isOpen) {
            fetchFollowers();
            console.log(followers);
        }
    }, [props.isOpen]);
    const toggleFollow = async (username: string) => {
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
                        }}>
                        <div className="flex items-center">
                            <img src={follower.avatarUrl} alt={follower.fullname} className="w-8 h-8 rounded-full" />
                            <span className="ml-2 font-semibold">{follower.fullname}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                toggleFollow(follower.username)
                            }
                            }
                            className={`px-3 py-1 rounded-full text-sm ${follower.follow ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {follower.follow ? 'Unfollow' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
        </CustomModal>
    )
}

export default FollowingsModal