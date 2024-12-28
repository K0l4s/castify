import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useEffect, useState } from "react";
import { userCard } from "../../../models/User";
import { userService } from "../../../services/UserService";
import CustomModal from "../../UI/custom/CustomModal";

interface ConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateConversationModal = (props: ConversationModalProps) => {
    const username = useSelector((state: RootState) => state.auth.user?.username);

    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await userService.getFollowings(username?.toString() || "", pageNumber, pageSize);
            setFollowers(response.data.data);
            setTotalPages(response.data.totalPages);
        };
        if (props.isOpen) {
            fetchFollowers();
        }
    }, [props.isOpen, pageNumber]);

    const handleSelectUser = (user: userCard) => {
        setSelectedUsers((prev) => [...prev, user]);
        setFollowers((prev) => prev.filter((follower) => follower.id !== user.id));
    };

    const handleDeselectUser = (user: userCard) => {
        setFollowers((prev) => [...prev, user]);
        setSelectedUsers((prev) => prev.filter((selected) => selected.id !== user.id));
    };

    return (
        <CustomModal isOpen={props.isOpen} onClose={props.onClose} title="Create conversation" size="md" animation="fade" closeOnEsc closeOnOutsideClick>
            <div className="p-4 space-y-4">
                {/* Selected Users */}
                {/* nút hành động */}
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Selected Users</h3>
                    {selectedUsers.length > 0 ? (
                        selectedUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                                <div className="flex items-center">
                                    <img src={user.avatarUrl} alt={user.fullname} className="w-8 h-8 rounded-full" />
                                    <span className="ml-2 font-semibold">{user.fullname}</span>
                                </div>
                                <button
                                    onClick={() => handleDeselectUser(user)}
                                    className="px-2 py-1 text-sm text-white bg-red-500 rounded-md"
                                >
                                    -
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No users selected.</p>
                    )}
                </div>

                {/* Available Followers */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Available Users</h3>
                    {followers.length > 0 ? (
                        followers.map((follower) => (
                            <div key={follower.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                                <div className="flex items-center">
                                    <img src={follower.avatarUrl} alt={follower.fullname} className="w-8 h-8 rounded-full" />
                                    <span className="ml-2 font-semibold">{follower.fullname}</span>
                                </div>
                                <button
                                    onClick={() => handleSelectUser(follower)}
                                    className="px-2 py-1 text-sm text-white bg-green-500 rounded-md"
                                >
                                    +
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No available users.</p>
                    )}
                </div>
            </div>
        </CustomModal>
    );
};

export default CreateConversationModal;
