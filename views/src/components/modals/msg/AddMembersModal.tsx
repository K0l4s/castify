import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { userCard } from "../../../models/User";
import { userService } from "../../../services/UserService";
import CustomModal from "../../UI/custom/CustomModal";
import CustomButton from "../../UI/custom/CustomButton";
import { FaSearch } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { conversationService } from "../../../services/ConversationService";
import { FullMemberInfor } from "../../../models/Conversation";
import { useToast } from "../../../context/ToastProvider";

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded?: () => void; // optional callback after success
    members: FullMemberInfor[];
    setMembers: React.Dispatch<React.SetStateAction<FullMemberInfor[]>>;
}

const AddMembersModal = ({ isOpen, onClose, onAdded, members,setMembers }: AddMembersModalProps) => {
    const { id: groupId } = useParams();
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
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
        if (isOpen) {
            fetchFollowers(true);
            setSelectedUsers([]);
            setSearchQuery("");
        }
    }, [isOpen]);

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

    const handleAddMembers = async () => {
        if (!groupId) return;

        try {
            const request = await conversationService.addMembers(
                selectedUsers.map(u => u.id),
                groupId
            );
            // console.log(request.data);
            const newMembers:FullMemberInfor[] = await request.data;
            setMembers((prev) => [...prev, ...newMembers]);
            onClose();
            onAdded?.();
        } catch (error) {
            console.error("Failed to add members:", error);
        }
    };

    const handleSearch = async () => {
        setPageNumber(0);
        fetchFollowers(true);
    };
    const isAlreadyMember = (userId: string) => {
        return members.some(member => member.members.id === userId);
    };
    const toast = useToast();
    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Members to Group"
            size="lg"
            animation="fade"
            closeOnEsc
            closeOnOutsideClick
        >
            <div className="p-4 space-y-4">
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
                                followers.map((user) => {
                                    const alreadyInGroup = isAlreadyMember(user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            className={`flex justify-between items-center p-2 rounded-xl transition cursor-pointer ${alreadyInGroup
                                                ? "cursor-not-allowed text-gray-400 hover:bg-transparent"
                                                : "hover:bg-green-700/10"
                                                }`}
                                            onClick={() => {
                                                if (!alreadyInGroup) handleSelectUser(user);
                                                else toast.error("User is already in the group.");
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <img src={user.avatarUrl} alt={user.fullname} className="w-8 h-8 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{user.fullname}</span>
                                                    <span className="text-sm text-gray-500">@{user.username}</span>
                                                </div>
                                            </div>
                                            {alreadyInGroup && (
                                                <span title="Already in group" className="text-xs text-gray-400">👥</span>
                                            )}
                                        </div>
                                    );
                                })
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
                                    <div key={user.id} className="flex justify-between items-center hover:bg-red-700/10 p-2 rounded-xl cursor-pointer transition"
                                        onClick={() => handleDeselectUser(user)}>
                                        <div className="flex items-center gap-2 w-full">
                                            <img src={user.avatarUrl} alt={user.fullname} className="w-8 h-8 rounded-full" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{user.fullname}</span>
                                                <span className="text-sm text-gray-500">@{user.username}</span>
                                            </div>
                                        </div>
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
                        onClick={handleAddMembers}
                        disabled={selectedUsers.length === 0}
                    >
                        Add Members
                    </CustomButton>
                </div>
            </div>
        </CustomModal>
    );
};

export default AddMembersModal;
