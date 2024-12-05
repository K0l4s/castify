import { useEffect, useState } from "react";
import { BasicUser } from "../../../models/User";
import { userService } from "../../../services/UserService";
import UserCard from "../../../components/admin/user/UserCard";
import CustomTable from "../../../components/UI/custom/CustomTable";
import { BiLeftArrow, BiRightArrow, BiTable } from "react-icons/bi";
import { BsCardHeading } from "react-icons/bs";
import ConfirmBox from "../../../components/UI/dialogBox/ConfirmBox";
import { Role } from "../../../constants/Role";
const initBasicUser: BasicUser = {
  id: '',
  fullname: '',
  username: '',
  avatarUrl: '',
  coverUrl: '',
  birthday: new Date(),
  address: '',
  phone: '',
  email: '',
  badgesId: [],
  role: Role.U,
  totalFollower: 0,
  totalFollowing: 0,
  totalPost: 0,
  active: false,
  nonBanned: false,
  nonLocked: false
};
const AdminUserPage = () => {
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [isTable, setIsTable] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUserBan, setSelectedUserBan] = useState<BasicUser >(initBasicUser);
  const [currentPage,
    // setCurrentPage
  ] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await userService.getAllUser(currentPage - 1, 10);
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
    };
    fetchUsers();
  }, []);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleOpenConfirm = () => {
      setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
      console.log('Đã xác nhận!');
      await userService.toggleBanUser(selectedUserBan.id).then(
          () => {
            selectedUserBan.nonBanned = !selectedUserBan.nonBanned;
            setUsers(users.map(user => user.id === selectedUserBan.id ? selectedUserBan : user));
              setIsConfirmOpen(false);
          }
      );

  };

  const handleCancel = () => {
      console.log('Đã hủy!');
      setIsConfirmOpen(false);
  };
  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Quản lý người dùng</h1>
      <div className="flex items-center px-4 py-2 mb-5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
          <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
        </svg>
        <input
          type="search"
          // value={searchQuery}
          // onChange={handleSearch}
          // onFocus={handleSearchFocus}
          // onBlur={handleSearchBlur}
          placeholder="Search for username, email, phone..."
          className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
          aria-label="Search"
          data-testid="search-input"
        />

      </div>
      <div className="flex gap-2 justify-self-end mb-2 text-black dark:text-white">
        <BsCardHeading onClick={() => setIsTable(false)} className={`text-2xl cursor-pointer ${!isTable && 'text-blue-500'}`} />
        <BiTable onClick={() => setIsTable(true)} className={`text-2xl cursor-pointer  ${isTable && 'text-blue-500'}`} />
      </div>
      {isTable ? (
        <CustomTable headers={["ID", "Fullname", "Username", "Active", "Banned","Action"]}>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.fullname}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                >
                  {user.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full ${user.nonBanned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                >
                  {user.nonBanned ? "Not Banned" : "Banned"}
                </span>
              </td>
              <td>
                <button className="w-full text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
                  onClick={() => {
                    setSelectedUserBan(user);
                    handleOpenConfirm();
                  }}
                >
                  Ban
                </button>
              </td>
              <ConfirmBox
                isOpen={isConfirmOpen}
                title="Xác nhận hành động"
                message="Do you want to lock this account?"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirmText="Đồng ý"
                cancelText="Hủy"
            />
            </tr>
          ))}
        </CustomTable>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col h-full">
              <UserCard user={user} />
            </div>
          ))}
        </div>

      )}
      {/* paginated */}
      <div className="flex justify-center mt-8 gap-2">
        <button className={`bg-blue-500 text-white px-4 py-2 rounded-md ${currentPage - 1 <= 0 && 'bg-gray-500 cursor-not-allowed'}`}
          disabled={currentPage - 1 <= 0}><BiLeftArrow /></button>
        <button className={`bg-blue-500 text-white px-4 py-2 rounded-md `}>{currentPage}</button>
        <button className={`bg-blue-500 text-white px-4 py-2 rounded-md ${currentPage + 1 >= totalPages && 'bg-gray-500 cursor-not-allowed'}`}
          disabled={currentPage + 1 >= totalPages}><BiRightArrow /></button>
      </div>

    </div>

  );
};


export default AdminUserPage;
