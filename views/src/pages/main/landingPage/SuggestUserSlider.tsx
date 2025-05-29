import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/UserService';
import { CgUserList } from 'react-icons/cg';
import { BsPostcard } from 'react-icons/bs';

interface Frame {
  id: string;
  name: string;
  imageURL: string;
  price: number;
}

interface User {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string | null;
  usedFrame: Frame | null;
  totalFollower: number;
  totalFollowing: number;
  totalPost: number;
  follow: boolean;
}

const defaultAvatar =
  'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740';

const UserCardSwiper: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getSuggestUser();
        setUsers(response.data);
      } catch (error) {
        console.error('Lỗi lấy gợi ý người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  if (!users.length) return null;

  return (
    <div className="relative w-1/3 h-[430px] mb-10 rounded-xl overflow-hidden mx-auto ">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={2}
        loop={true}
        spaceBetween={-300}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination]}
        className="h-full"
        breakpoints={{
          320: { slidesPerView: 1.2 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2.5 },
        }}
      >
        {users.map((user, index) => (
          <SwiperSlide
            key={user.id}
            className="w-[250px] h-full bg-black/80 rounded-xl overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-500"
          // onClick={() => navigate(`/profile/${user.username}`)}
          >
            {/* Avatar + frame */}
            <div className="relative w-full h-[300px]">
              <img
                src={user.avatarUrl || defaultAvatar}
                alt={user.fullname}
                className="w-full h-full object-cover"
              />
              {user.usedFrame && (
                <img
                  src={user.usedFrame.imageURL}
                  alt="frame"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 w-full px-5 py-4 bg-black/70 text-white backdrop-blur-md">
              <span className="inline-block text-xs bg-red-600 px-3 py-1 rounded-full font-semibold mb-2">
                Suggest #{index + 1}
              </span>
              <h2 className="text-xl font-bold truncate">{user.fullname}</h2>
              <p className="text-sm text-gray-300">@{user.username}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-2">
                <span className="flex items-center gap-1">
                  <BsPostcard /> {user.totalPost} posts
                </span>
                <span className="flex items-center gap-1">
                  <CgUserList /> {user.totalFollower} followers
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default UserCardSwiper;
