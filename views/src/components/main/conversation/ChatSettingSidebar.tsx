import { useState } from "react";
import { ConversationDetail, FullMemberInfor } from "../../../models/Conversation";
import CustomInput from "../../UI/custom/CustomInput";
import { conversationService } from "../../../services/ConversationService";
import CustomButton from "../../UI/custom/CustomButton";
import { FaKey } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import AddMembersModal from "../../modals/msg/AddMembersModal";
import { FcDeleteRow } from "react-icons/fc";

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
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4 sticky top-[66px] right-0 h-[calc(100vh-66px)] overflow-y-auto overflow-x-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className={`flex flex-col gap-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                <h2 className="text-xl font-semibold mb-4">Chat Information</h2>

                {/* group avatar */}
                <div
                    className="relative w-32 h-32 rounded-full cursor-pointer m-auto"
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    onClick={!isLoading ? handleImageClick : undefined}
                >
                    <img src={previewUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    {hovering && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                            <span className="text-white text-lg">+</span>
                        </div>
                    )}
                    <input id="avatarInput" type="file" className="hidden" onChange={handleFileChange} />
                </div>

                {selectedFile && (
                    <div className="flex gap-2 mt-2 m-auto">
                        <button onClick={handleConfirmChange} className="bg-blue-500 text-white p-2 rounded">Confirm</button>
                        <button onClick={handleCancelChange} className="bg-gray-500 text-white p-2 rounded">Cancel</button>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Group Name</h3>
                        {isEditGroupName ? (
                            <CustomButton
                                className="text-sm text-red-500 font-semibold"
                                variant="danger"
                                onClick={() => {
                                    setIsEditGroupName(!isEditGroupName);
                                    setIsNameChanged(false);
                                    setGroupName(props.chatDetail.title);
                                }}
                            >Cancel</CustomButton>
                        ) : (
                            <CustomButton
                                className="text-sm text-blue-500 font-semibold"
                                onClick={() => {
                                    setIsEditGroupName(!isEditGroupName);
                                    setIsNameChanged(false);
                                }}
                            >Change</CustomButton>
                        )}
                    </div>
                    {isEditGroupName ? (
                        <div>
                            <CustomInput
                                value={groupName}
                                onChange={(e) => {
                                    setGroupName(e.target.value);
                                    setIsNameChanged(true);
                                }}
                            />
                            {isNameChanged && (
                                <CustomButton className="mt-2" onClick={handleChangeName}>
                                    Save Name
                                </CustomButton>
                            )}

                        </div>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">{props.chatDetail.title}</span>
                    )}

                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-md text-gray-500 font-semibold">Members ({props.chatDetail.memberSize})</h3>
                        {/* add button */}
                        <div className="flex gap-2 mt-2">
                            <CustomButton
                            onClick={() => setIsOpenAddMembers(true)}
                            className="text-sm text-blue-500 font-semibold"
                            >
                                Add
                            </CustomButton>
                        </div>
                    </div>
                    {props.memberList.map((member) => (
                        <div key={member.members.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer">
                            <img
                                src={member.members.avatarUrl ? member.members.avatarUrl : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt={member.members.fullname}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className={`flex flex-col flex-1 ${member.role === "LEADER" ? "text-yellow-500" :
                                member.role === "DEPUTY" ? "text-blue-500" : "text-white"
                                }`}>
                                <span className={`font-medium flex items-center gap-1`}>
                                    {member.members.fullname}
                                    {member.role === "LEADER" && <span className="text-yellow-500 text-sm font-semibold"><FaKey /> </span>}
                                </span>
                                <span className="text-sm">@{member.members.username}</span>
                            </div>
                            <FiMoreVertical className="text-gray-400 hover:text-gray-200 cursor-pointer" size={20} />
                            <FcDeleteRow className="text-gray-400 hover:text-red-500 cursor-pointer" size={20} onClick={() => handleDeleteMember(member.members.id)} />
                        </div>
                    ))}
                </div>
            </div>
            <AddMembersModal
                isOpen={isOpenAddMembers}
                onClose={()=>setIsOpenAddMembers(false)}
                members={props.memberList}
                setMembers={props.setMemberList}
                />
        </div>
    );
};

export default ChatSettingSidebar;
