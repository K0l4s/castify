import { useState, useEffect, useRef } from 'react';
import { getGenres, createGenre, updateGenre, deleteGenre, getTotalActiveGenresCount } from "../../../services/GenreService";
import { Genre } from "../../../models/GenreModel";
import { MdOutlineModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { useToast } from "../../../context/ToastProvider";

const AdminGenrePage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalGenreCount, setTotalGenreCount] = useState<number>(0);
  // const [mostUsedGenres, setMostUsedGenres] = useState<Genre[]>([]);
  // const [genreCountByDate, setGenreCountByDate] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [newGenreName, setNewGenreName] = useState<string>('');
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteGenreId, setDeleteGenreId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);

  const deleteModalRef = useRef<HTMLDivElement | null>(null);

  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getGenres()
      .then((data) => {
        setAllGenres(data);
        setGenres(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading genres:", error);
        toast.error("Có lỗi xảy ra");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetch statistics data when component is mounted
    fetchStatistics();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      // Get total genre count
      const totalCount = await getTotalActiveGenresCount ();
      setTotalGenreCount(totalCount);

      // // Get most used genres
      // const mostUsed = await getMostUsedGenres();
      // setMostUsedGenres(mostUsed);

      // // Get genre count by date (daily, weekly, monthly)
      // const countByDate = await getGenreCountByDate();
      // setGenreCountByDate(countByDate);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Có lỗi xảy ra khi lấy dữ liệu thống kê');
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) {
      toast.error('Bạn chưa nhập tên thể loại.');
      return;
    }

    try {
      const newGenre = await createGenre(newGenreName);
      setAllGenres([...allGenres, newGenre]);
      setGenres([...genres, newGenre]);
      setNewGenreName('');
      toast.success('Thêm thể loại mới thành công!');
    } catch (error) {
      console.error('Error creating genre:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!.');
    }
  };

  const handleUpdateGenre = async () => {
    if (!editingGenre || !editingGenre.name.trim()) {
      toast.error('Bạn chưa nhập tên thể loại.');
      return;
    }

    try {
      const updatedGenre = await updateGenre(editingGenre.id, editingGenre.name);
      const updateGenres = (list: Genre[]) => 
        list.map((genre) => (genre.id === updatedGenre.id ? updatedGenre : genre));
      
      setAllGenres(updateGenres(allGenres));
      setGenres(updateGenres(genres));
      setEditingGenre(null);
      toast.success('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating genre:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDeleteGenre = async () => {
    if (deleteGenreId) {
      try {
        await deleteGenre(deleteGenreId);
        const filterGenres = (list: Genre[]) => 
          list.filter((genre) => genre.id !== deleteGenreId);
        
        setAllGenres(filterGenres(allGenres));
        setGenres(filterGenres(genres));
        toast.success('Xóa thành công');
        setIsDeleting(false);
        setDeleteGenreId(null);
      } catch (error) {
        console.error('Error deleting genre:', error);
        toast.error('Có lỗi xảy ra, vui lòng thử lại!');
        setIsDeleting(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteGenreId(null);
  };

  const handleEditGenre = (genre: Genre) => {
    setEditingGenre({ ...genre });
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingGenre(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setGenres(allGenres);
      return;
    }

    const filteredGenres = allGenres.filter((genre) =>
      genre.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredGenres.length === 0) {
      toast.info('Không tìm thấy!');
    }
    
    setGenres(filteredGenres);
  };

  const handleMenuToggle = (genreId: string) => {
    setOpenMenuId(openMenuId === genreId ? null : genreId); 
  };

  const handleDeleteClick = (genreId: string) => {
    setIsDeleting(true);
    setDeleteGenreId(genreId);
    setOpenMenuId(null);
  };

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Quản lý thể loại</h1>

      {loading && <p className="text-blue-500">Loading genres...</p>}

      {/* Thống kê */}
`    <div className="mb-8">
      <h3 className="text-2xl font-extrabold mb-6 text-black dark:text-white">Thống kê thể loại</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tổng số thể loại */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-2xl shadow-xl text-white hover:shadow-2xl transition-all duration-300">
          <h4 className="text-xl font-semibold mb-4">Tổng số thể loại</h4>
          <p className="text-3xl font-bold">{totalGenreCount}</p>
          <div className="mt-4">
            <p className="text-sm">Thể loại tổng quan</p>
          </div>
        </div>

        {/* Top 5 thể loại được sử dụng nhiều nhất */}
        {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">TOP 5 thể loại được sử dụng nhiều nhất</h4>
          <ul className="space-y-2">
            {mostUsedGenres.map((genre) => (
              <li key={genre.id} className="text-gray-900 dark:text-white text-lg">{genre.name}</li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
`
      <div className="mb-6">
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center px-4 py-2 mb-5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
              <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
            </svg>
            <input
              type="search"
              onChange={handleSearchChange}
              value={searchQuery}
              placeholder="Search for genres..."
              className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Thêm thể loại mới</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Enter genre name"
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 dark:bg-gray-800 text-black dark:text-white"
          />
          <button
            onClick={handleCreateGenre}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Danh sách thể loại</h2>

        <div className="flex flex-wrap gap-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="flex-none min-w-[180px] inline-flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md"
            >
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">{genre.name}</span>
              <div className="relative">
                <button
                  className="inline-flex items-center justify-center font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-4 py-2 text-base rounded-md transition-all duration-200"
                  onClick={() => handleMenuToggle(genre.id)}
                >
                  <BsThreeDots />
                </button>

                {openMenuId === genre.id && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md z-10">
                    <div className="flex flex-col gap-2 p-2">
                      <button
                        onClick={() => handleEditGenre(genre)}
                        className="flex items-center gap-2 px-4 py-2 text-md bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 whitespace-nowrap"
                      >
                        <MdOutlineModeEdit />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(genre.id)}
                        className="flex items-center gap-2 px-4 py-2 text-md bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <MdDelete />
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Edit Genre */}
      {editingGenre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center text-black dark:text-white">Chỉnh sửa thể loại</h3>
            <input
              type="text"
              value={editingGenre.name}
              onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
              placeholder="Enter genre name"
              className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 dark:bg-gray-800 text-black dark:text-white"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateGenre}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Xác nhận xóa */}
      {isDeleting && (
        <div ref={deleteModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center text-black dark:text-white">Bạn có chắc chắn xóa thể loại này không?</h3>
            <div className="flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteGenre}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenrePage;
