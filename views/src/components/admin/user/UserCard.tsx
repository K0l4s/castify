import { useState } from "react";
import { BasicUser } from "../../../models/User";
import ConfirmBox from "../../UI/dialogBox/ConfirmBox";

interface UserCardProps {
    user: BasicUser;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleOpenConfirm = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirm = () => {
        console.log('Đã xác nhận!');
        setIsConfirmOpen(false);
    };

    const handleCancel = () => {
        console.log('Đã hủy!');
        setIsConfirmOpen(false);
    };
    return (
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-md overflow-hidden">
            <img
                src={user.coverUrl}
                alt="cover"
                className="h-32 w-full object-cover"
            />
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">{user.fullname}</h2>
                        <p className="text-gray-500">@{user.username}</p>
                    </div>
                </div>
                <div className="mt-4 text-sm">
                    <p>
                        <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p>
                        <span className="font-medium">Phone:</span> {user.phone}
                    </p>
                    <p>
                        <span className="font-medium">Address:</span> {user.address}
                    </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span
                        className={`text-sm px-3 py-1 rounded-full ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {user.active ? "Active" : "Inactive"}
                    </span>
                    <span
                        className={`text-sm px-3 py-1 rounded-full ${user.nonBanned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {user.nonBanned ? "Not Banned" : "Banned"}
                    </span>
                </div>
                <div className="mt-4 flex gap-2">
                    <button className="w-full text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md">
                        Chi tiết
                    </button>
                    <button className="w-full text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md" onClick={handleOpenConfirm}>
                        Khóa
                    </button>
                </div>
            </div>
            <ConfirmBox
                isOpen={isConfirmOpen}
                title="Xác nhận hành động"
                message="Do you want to lock this account?"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirmText="Đồng ý"
                cancelText="Hủy"
            />
        </div>
    );
};

export default UserCard;