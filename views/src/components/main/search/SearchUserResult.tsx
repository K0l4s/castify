import { useLocation } from "react-router-dom";
import UserInforCard from "../profile/UserInforCard";
import { userCard } from "../../../models/User";
import { useEffect, useState } from "react";
import { userService } from "../../../services/UserService";

const SearchUserResult = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search).get('keyword');
    const [users, setUsers] = useState<userCard[]>([]);
    const [pageSize] = useState<number>(5); // Đặt pageSize nhỏ để kiểm tra dễ dàng hơn
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    useEffect(() => {
        userService.searchUser(pageNumber, pageSize, queryParams?.toString() || '').then(res => {
            // Kiểm tra nếu data là mảng và không rỗng
            if (pageNumber === 0) {
                setUsers(res.data.data); // Nếu là lần đầu tải dữ liệu, reset lại list
            } else {
                setUsers(prevUsers => [...prevUsers, ...res.data.data]); // Thêm dữ liệu mới vào list cũ
            }
            setTotalPages(res.data.totalPages);
        }).catch(err => {
            console.error("Error fetching users:", err);
            setUsers([]); // Xử lý lỗi và đảm bảo users luôn là mảng
        });
    }, [pageNumber, pageSize, queryParams]); // Thêm dependencies để theo dõi thay đổi

    const handleLoadMore = () => {
        setPageNumber(prevPage => prevPage + 1); // Tăng số trang lên để tải thêm dữ liệu
    };

    return (
        <div className="flex flex-col item-centers bg-white dark:bg-gray-700 p-2 rounded-xl">
            <div className="flex flex-wrap items-center justify-content">
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <div key={index} className="flex">
                            <UserInforCard {...user} />
                        </div>
                    ))
                ) : (
                    <div className="text-center">No user found</div>
                )}
            </div>
            {pageNumber < totalPages && ( // Hiển thị nút Load More nếu còn trang
                <p
                    onClick={handleLoadMore}
                    className="mt-4 px-4 py-2 text-blue-500 text-center cursor-pointer rounded hover:text-blue-600"
                >
                    Load More
                </p>
            )}
        </div>
    );
};

export default SearchUserResult;
