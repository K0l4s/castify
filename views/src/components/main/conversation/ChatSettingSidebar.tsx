import { useState } from "react";
import { ConversationDetail, FullMemberInfor } from "../../../models/Conversation";
import CustomInput from "../../UI/custom/CustomInput";
import { conversationService } from "../../../services/ConversationService";
import CustomButton from "../../UI/custom/CustomButton";
import { FaKey } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import AddMembersModal from "../../modals/msg/AddMembersModal";
import { FcDeleteRow } from "react-icons/fc";
import Avatar from "../../UI/user/Avatar";

interface ChatSettingProps {
    chatDetail: ConversationDetail;
    isShow: boolean;
    memberList: FullMemberInfor[];
    setMemberList: React.Dispatch<React.SetStateAction<FullMemberInfor[]>>;
    setChatDetail: React.Dispatch<React.SetStateAction<ConversationDetail>>;
}

const ChatSettingSidebar = (props: ChatSettingProps) => {
    if (!props.isShow) return null;

    const [hovering, setHovering] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(props.chatDetail.imageUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditGroupName, setIsEditGroupName] = useState(false);
    const [groupName, setGroupName] = useState(props.chatDetail.title);
    const [isNameChanged, setIsNameChanged] = useState(false);
    const [isOpenAddMembers, setIsOpenAddMembers] = useState(false);

    const handleImageClick = () => {
        document.getElementById("avatarInput")?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleConfirmChange = async () => {
        if (selectedFile) {
            try {
                setIsLoading(true);
                await conversationService.changeImage(selectedFile, props.chatDetail.id);
                setSelectedFile(null);
                props.setChatDetail(prev => ({
                    ...prev,
                    imageUrl: previewUrl,
                }));
            } catch (error) {
                console.error("Failed to change image:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancelChange = () => {
        setSelectedFile(null);
        setPreviewUrl(props.chatDetail.imageUrl);
    };

    const handleChangeName = async () => {
        if (!groupName.trim() || groupName === props.chatDetail.title) return;

        try {
            setIsLoading(true);
            await conversationService.changeTitle(groupName.trim(), props.chatDetail.id);
            props.setChatDetail(prev => ({
                ...prev,
                title: groupName.trim(),
            }));
            setIsNameChanged(false);
            setIsEditGroupName(false);
        } catch (error) {
            console.error("Failed to change group name:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        try {
            setIsLoading(true);
            await conversationService.deleteMembers(memberId, props.chatDetail.id);
            props.setMemberList(prev => prev.filter(member => member.members.id !== memberId));
        }
        catch (error) {
            console.error("Failed to delete member:", error);
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="w-80 bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700 p-6 sticky top-[66px] right-0 h-[calc(100vh-66px)] overflow-y-auto overflow-x-hidden relative shadow-xl transition-all duration-300">
            {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 rounded-l-2xl">
            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            )}

            <div className={`flex flex-col gap-6 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300 tracking-tight">Chat Information</h2>

            {/* group avatar */}
            <div
            className="relative w-32 h-32 rounded-full cursor-pointer m-auto group shadow-lg transition-transform duration-200 hover:scale-105 flex items-center justify-center"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={!isLoading ? handleImageClick : undefined}
            >
            <img src={previewUrl} alt="" className="w-full h-full rounded-full object-cover border-4 border-blue-200 dark:border-blue-700" />
            <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-200 ${hovering ? "bg-black/50" : "bg-transparent"}`}>
            {hovering && (
                <span className="text-white text-3xl font-bold">+</span>
            )}
            </div>
            <input id="avatarInput" type="file" className="hidden" onChange={handleFileChange} />
            </div>

            {selectedFile && (
            <div className="flex gap-3 mt-2 justify-center">
            <button
                onClick={handleConfirmChange}
                className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg shadow font-semibold transition"
            >
                Confirm
            </button>
            <button
                onClick={handleCancelChange}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition"
            >
                Cancel
            </button>
            </div>
            )}

            <div>
            <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-blue-600 dark:text-blue-300 mb-1">Group Name</h3>
            {isEditGroupName ? (
                <CustomButton
                className="text-sm text-red-500 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition"
                variant="danger"
                onClick={() => {
                setIsEditGroupName(!isEditGroupName);
                setIsNameChanged(false);
                setGroupName(props.chatDetail.title);
                }}
                >Cancel</CustomButton>
            ) : (
                <CustomButton
                className="text-sm text-blue-500 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                onClick={() => {
                setIsEditGroupName(!isEditGroupName);
                setIsNameChanged(false);
                }}
                >Change</CustomButton>
            )}
            </div>
            {isEditGroupName ? (
            <div className="flex flex-col gap-2">
                <CustomInput
                value={groupName}
                onChange={(e) => {
                setGroupName(e.target.value);
                setIsNameChanged(true);
                }}
                className="rounded-lg border-blue-300 focus:border-blue-500"
                />
                {isNameChanged && (
                <CustomButton className="mt-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition" onClick={handleChangeName}>
                Save Name
                </CustomButton>
                )}
            </div>
            ) : (
            <span className="text-gray-700 dark:text-gray-300 text-lg font-medium">{props.chatDetail.title}</span>
            )}
            </div>

            <div>
            <div className="flex items-center justify-between mb-2">
            <h3 className="text-md text-blue-600 dark:text-blue-300 font-semibold">Members <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full">{props.chatDetail.memberSize}</span></h3>
            <CustomButton
                onClick={() => setIsOpenAddMembers(true)}
                className="text-sm text-white bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 font-semibold px-3 py-1 rounded-lg shadow transition"
            >
                Add
            </CustomButton>
            </div>
            <div className="flex flex-col gap-2">
            {props.memberList.map((member) => (
                <div
                key={member.members.id}
                className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-xl cursor-pointer shadow-sm transition group"
                >
                <Avatar
                width="w-10"
                height="h-10"
                avatarUrl={member.members.avatarUrl ? member.members.avatarUrl : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                usedFrame={member.members?.usedFrame}
                alt={member.members.fullname}
                />
                <div className={`flex flex-col flex-1 ${member.role === "LEADER" ? "text-yellow-500" :
                member.role === "DEPUTY" ? "text-blue-500" : "text-gray-800 dark:text-gray-200"
                }`}>
                <span className="font-medium flex items-center gap-1">
                {member.members.fullname}
                {member.role === "LEADER" && <span className="text-yellow-500 text-base font-semibold"><FaKey /> </span>}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">@{member.members.username}</span>
                </div>
                <FiMoreVertical className="text-gray-400 group-hover:text-blue-400 cursor-pointer transition" size={20} />
                <FcDeleteRow
                className="text-gray-400 group-hover:text-red-500 cursor-pointer transition"
                size={20}
                onClick={() => handleDeleteMember(member.members.id)}
                />
                </div>
            ))}
            </div>
            </div>
            </div>
            <AddMembersModal
            isOpen={isOpenAddMembers}
            onClose={() => setIsOpenAddMembers(false)}
            members={props.memberList}
            setMembers={props.setMemberList}
            />
        </div>
    );
};

export default ChatSettingSidebar;
