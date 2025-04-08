import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { userCard } from "../../../models/User";
import { userService } from "../../../services/UserService";
import CustomModal from "../../UI/custom/CustomModal";
import CustomButton from "../../UI/custom/CustomButton";
import { conversationService } from "../../../services/ConversationService";
import { shortConversation } from "../../../models/Conversation";
import { FaSearch } from "react-icons/fa";

interface ConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: shortConversation[];
    setConversations: React.Dispatch<React.SetStateAction<shortConversation[]>>;
}

const CreateConversationModal = (props: ConversationModalProps) => {
    const userId = useSelector((state: RootState) => state.auth.user?.id);
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
    const [conversationName, setConversationName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageNumber, setPageNumber] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const pageSize = 10;

    const fetchFollowers = useCallback(async (reset = false) => {
        try {
            const response = await userService.getFriends(reset ? 0 : pageNumber, pageSize, searchQuery.trim());
            const newData = response.data.data;
            // nhân bản data
            if (reset) {
                setFollowers(newData);
                setPageNumber(1);
            } else {
                setFollowers((prev) => [...prev, ...newData]);
                setPageNumber((prev) => prev + 1);
            }

            setHasMore(newData.length === pageSize);
        } catch (err) {
            console.error("Failed to fetch followers:", err);
        }
    }, [pageNumber, searchQuery]);

    useEffect(() => {
        if (props.isOpen) {
            fetchFollowers(true);
            setSelectedUsers([]);
            setConversationName("");
            setSearchQuery("");
        }
    }, [props.isOpen]);

    useEffect(() => {
        if (!hasMore || !loadMoreRef.current) return;

        observer.current?.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchFollowers();
            }
        });
        observer.current.observe(loadMoreRef.current);

        return () => observer.current?.disconnect();
    }, [fetchFollowers, hasMore]);

    const handleSelectUser = (user: userCard) => {
        setSelectedUsers((prev) => [...prev, user]);
        setFollowers((prev) => prev.filter((f) => f.id !== user.id));
    };

    const handleDeselectUser = (user: userCard) => {
        setFollowers((prev) => [...prev, user]);
        setSelectedUsers((prev) => prev.filter((s) => s.id !== user.id));
    };

    const handleCreateConversation = async () => {
        const currentTime = new Date().toISOString();

        const conversationData = {
            title: conversationName || "New Conversation",
            memberList: [
                {
                    memberId: userId || "",
                    role: "LEADER",
                    joinTime: currentTime,
                    isAccepted: true
                },
                ...selectedUsers.map((user) => ({
                    memberId: user.id,
                    role: "MEMBER",
                    joinTime: currentTime,
                    isAccepted: false
                }))
            ]
        };

        try {
            const response = await conversationService.createConversation(conversationData);
            props.onClose();
            props.setConversations((prev) => [
                {
                    id: response.data.id,
                    title: response.data.title,
                    imageUrl: response.data.imageUrl,
                    memberSize: response.data.memberSize,
                },
                ...prev
            ]);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    const handleSearch = async () => {
        setPageNumber(0);
        fetchFollowers(true);
    };

    return (
        <CustomModal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Create Conversation"
            size="lg"
            animation="fade"
            closeOnEsc
            closeOnOutsideClick
        >
            <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                    {/* Conversation Name */}
                    <div>
                        <label htmlFor="conversation-name" className="block text-sm font-semibold text-gray-600">
                            Conversation Name
                        </label>
                        <input
                            type="text"
                            id="conversation-name"
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            placeholder="Enter conversation name"
                            value={conversationName}
                            onChange={(e) => setConversationName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Friends List */}
                        <div>
                            <h3 className="text-md font-semibold mb-2">Your Friends</h3>
                            <div className="relative mb-3">
                                <input
                                    type="text"
                                    placeholder="Search friends..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
                                >
                                    <FaSearch />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {followers.length > 0 ? (
                                    followers.map((user) => (
                                        <div key={user.id} className="flex justify-between items-center hover:bg-green-700/10 p-2 rounded-xl cursor-pointer transition"
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <div className="flex items-center gap-2 justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <img src={user.avatarUrl} alt={user.fullname} className="w-8 h-8 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">{user.fullname}</span>
                                                        <span className="text-sm text-gray-500">@{user.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <button
                                                className="text-white bg-green-500 px-2 rounded hover:bg-green-600 transition"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                +
                                            </button> */}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No available users.</p>
                                )}
                                <div ref={loadMoreRef} />
                            </div>
                        </div>

                        {/* Selected Users */}
                        <div>
                            <h3 className="text-md font-semibold mb-2">Selected Users</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectedUsers.length > 0 ? (
                                    selectedUsers.map((user) => (
                                        <div key={user.id} className="flex justify-between items-center  hover:bg-red-700/10 p-2 rounded-xl cursor-pointer transition"
                                            onClick={() => handleDeselectUser(user)}>
                                             <div className="flex items-center gap-2 justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <img src={user.avatarUrl} alt={user.fullname} className="w-8 h-8 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">{user.fullname}</span>
                                                        <span className="text-sm text-gray-500">@{user.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <button
                                                className="text-white bg-red-500 px-2 rounded hover:bg-red-600 transition"
                                                onClick={() => handleDeselectUser(user)}
                                            >
                                                -
                                            </button> */}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No users selected.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <CustomButton
                            onClick={handleCreateConversation}
                            disabled={selectedUsers.length === 0 || !conversationName.trim()}
                        >
                            Create
                        </CustomButton>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

export default CreateConversationModal;
