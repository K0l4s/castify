import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useEffect, useState } from "react";
import { userCard } from "../../../models/User";
import { userService } from "../../../services/UserService";
import CustomModal from "../../UI/custom/CustomModal";
import CustomButton from "../../UI/custom/CustomButton";
import { conversationService } from "../../../services/ConversationService";
import { shortConversation } from "../../../models/Conversation";

interface ConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: shortConversation[];
    setConversations: React.Dispatch<React.SetStateAction<shortConversation[]>>;
}

const CreateConversationModal = (props: ConversationModalProps) => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const userId = useSelector((state: RootState) => state.auth.user?.id); // Lấy ID người tạo

    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
    const [pageNumber] = useState(0);
    // const [ setTotalPages] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await userService.getFollowings(username?.toString() || "", pageNumber, pageSize);
            setFollowers(response.data.data);
            // setTotalPages(response.data.totalPages);
        };
        if (props.isOpen) {
            fetchFollowers();
            setSelectedUsers([]);
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

    const handleCreateConversation = async () => {
        const currentTime = new Date().toISOString(); // Thời gian hiện tại theo ISO

        const conversationData = {
            title: (document.getElementById("conversation-name") as HTMLInputElement).value,
            // name: username || "Unnamed Conversation",
            memberList: [
                {
                    memberId: userId || "",
                    role: "LEADER",
                    joinTime: currentTime,
                },
                ...selectedUsers.map((user) => ({
                    memberId: user.id,
                    role: "MEMBER",
                    joinTime: currentTime,
                })),
            ],
        };
        // console.log(conversationData);
        try {
            const response = await conversationService.createConversation(conversationData);
            console.log("Conversation created successfully");
            props.onClose(); // Đóng modal sau khi tạo thành công
            // console.log(response);
            // thêm vào conversations
            console.log(response.data);
            props.setConversations((prev) => [
                {
                    id: response.data.id,
                    title: response.data.title,
                    imageUrl: response.data.imageUrl,
                    memberSize: response.data.memberSize,
                },
                ...prev,
            ]);
            
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    return (
        <CustomModal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Create conversation"
            size="md"
            animation="fade"
            closeOnEsc
            closeOnOutsideClick
        >
            <div className="p-4 space-y-4">
                {/* Nút Tạo Cuộc Hội Thoại */}
                <div className="flex justify-end">
                    <CustomButton onClick={handleCreateConversation} disabled={selectedUsers.length === 0}>
                        Create conversation
                    </CustomButton>
                </div>
                {/* input name */}
                <div>
                    <label htmlFor="conversation-name" className="block text-sm font-semibold text-gray-600">
                        Conversation Name
                    </label>
                    <input
                        type="text"
                        id="conversation-name"
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                        placeholder="Enter conversation name"
                    />
                </div>
                {/* Người Dùng Được Chọn */}
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

                {/* Danh Sách Người Dùng Có Sẵn */}
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
