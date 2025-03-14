import { useEffect, useState } from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import { userCard } from '../../../models/User';
import { userService } from '../../../services/UserService';
interface FollowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
  }
//   avatarUrl
// : 
// null
// follow
// : 
// false
// fullname
// : 
// "Nhỉ Thế Vì Sao"
// id
// : 
// "675cbb65dbb45f2c90c19d62"
// totalFollower
// : 
// 0
// totalFollowing
// : 
// 1
// totalPost
// : 
// 0
// username
// : 
// "visaothenhi"
const FollowersModal = (props: FollowersModalProps) => {
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [pageNumber] = useState(0);
    // const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;
    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await userService.getFollowers(props.username,pageNumber,pageSize);
            setFollowers(response.data.data);
            // setTotalPages(response.data.totalPages);
            // console.log(response.data);
        };
        if (props.isOpen) {
            fetchFollowers();
            console.log(followers);
        }
    }, [props.isOpen]);
  return (
    <CustomModal isOpen={props.isOpen} onClose={props.onClose} title='Followers' size='md' animation='fade' closeOnEsc={true} closeOnOutsideClick={true}>
        <div className="p-4">
            {followers.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center">
                        <img src={follower.avatarUrl} alt={follower.fullname} className="w-8 h-8 rounded-full" />
                        <span className="ml-2 font-semibold">{follower.fullname}</span>
                    </div>
                    {follower.follow ? (
                        <button className="px-4 py-1 text-sm text-white bg-blue-500 rounded-md">Following</button>
                    ) : (
                        <button className="px-4 py-1 text-sm text-blue-500 border border-blue-500 rounded-md">Follow</button>
                    )}
                </div>
            ))}
        </div>
    </CustomModal>
  )
}

export default FollowersModal