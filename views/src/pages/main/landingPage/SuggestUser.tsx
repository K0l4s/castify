import { useEffect, useState } from 'react';
import { userCard } from '../../../models/User';
import { userService } from '../../../services/UserService';
import UserInforCard from '../../../components/main/profile/UserInforCard';

const PAGE_SIZE = 10;

const SuggestUser = () => {
    const [users, setUsers] = useState<userCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            setLoading(true);
            try {
                const res = await userService.getSuggestUser(pageNumber, PAGE_SIZE);
                const newUsers: userCard[] = res.data.content || [];
                setUsers(prev => (pageNumber === 0 ? newUsers : [...prev, ...newUsers]));
                setTotalPages(res.data.totalPages);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu gợi ý:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedUsers();
    }, [pageNumber]);

    const handleLoadMore = () => {
        if (pageNumber + 1 < totalPages && !loading) {
            setPageNumber(prev => prev + 1);
        }
    };

    return (
        <div className="mx-auto px-4">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center gap-3 border border-blue-100">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow">
                    <span className="text-4xl text-blue-500">🤝</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white mt-2">Khám phá kết nối mới</h2>
                <p className="text-blue-50 text-base text-center max-w-xs">
                    Tìm kiếm và kết nối với những người bạn cùng sở thích, mở rộng mạng lưới của bạn ngay hôm nay!
                </p>
            </div>

            {/* Danh sách người dùng */}
            {users.length === 0 && !loading && (
                <div className="text-center text-gray-400 py-16 text-lg">Không tìm thấy gợi ý nào.</div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
                {users.map(user => (

                        <UserInforCard key={user.id} {...user} />

                ))}
            </div>

            {/* Loading */}
            {loading && <div className="text-center text-blue-400 mt-8 text-base animate-pulse">Đang tải...</div>}

            {/* Nút tải thêm */}
            {!loading && pageNumber + 1 < totalPages && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-500 transition"
                    >
                        Tải thêm
                    </button>
                </div>
            )}

            {/* Đã hết */}
            {!loading && pageNumber + 1 >= totalPages && users.length > 0 && (
                <div className="text-center text-gray-800 dark:text-gray-200 mt-8 text-base">Bạn đã xem hết gợi ý</div>
            )}
        </div>
    );
};

export default SuggestUser;
