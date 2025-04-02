import { useState } from "react";
import { ConversationDetail, FullMemberInfor } from "../../../models/Conversation"
import CustomInput from "../../UI/custom/CustomInput";
import { conversationService } from "../../../services/ConversationService";

interface ChatSettingProps {
    chatDetail: ConversationDetail;
    isShow: boolean;
    memberList: FullMemberInfor[];
    setChatDetail: React.Dispatch<React.SetStateAction<ConversationDetail>>;
}

const ChatSettingSidebar = (props: ChatSettingProps) => {
    if (!props.isShow) return null;

    const [isEdit, setIsEdit] = useState<boolean>(true);
    const [hovering, setHovering] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(props.chatDetail.imageUrl);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4 sticky top-[66px] right-0 h-[calc(100vh-66px)] overflow-y-auto overflow-x-hidden relative">
            {/* Loading Overlay */}
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
                        <button
                            onClick={handleConfirmChange}
                            className="bg-blue-500 text-white p-2 rounded"
                            disabled={isLoading}
                        >
                            Confirm
                        </button>
                        <button
                            onClick={handleCancelChange}
                            className="bg-gray-500 text-white p-2 rounded"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <h3>Group name</h3>
                {isEdit ? (
                    <CustomInput value={props.chatDetail.title} />
                ) : (
                    <h2 className="text-xl font-semibold mb-4">{props.chatDetail.title}</h2>
                )}

                <div className="space-y-4">
                    <div className="flex flex-row gap-2">
                        <h3 className="text-sm text-gray-500 font-semibold">Created At:</h3>
                        <p className="text-gray-200">{new Date(props.chatDetail.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                        <h3 className="text-sm text-gray-500">Members ({props.chatDetail.memberSize})</h3>
                        {props.memberList.map((member) => (
                            <div key={member.members.id} className="flex items-center gap-3 p-2 border-b">
                                <img
                                    src={member.members.avatarUrl}
                                    alt={member.members.fullname}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className={`font-medium ${member.role === "LEADER" ? "text-yellow-500" : member.role === "DEPUTY" ? "text-blue-500" : "text-white"}`}>
                                    {member.members.fullname}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSettingSidebar;
