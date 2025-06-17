import { useState, useEffect, useRef } from 'react';
import { getGenres, createGenre, updateGenre, deleteGenre, getTotalActiveGenresCount } from "../../../services/GenreService";
import { Genre, genreCreateUpdate } from "../../../models/GenreModel";
// import { MdOutlineModeEdit } from "react-icons/md";
// import { MdDelete } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import { useToast } from "../../../context/ToastProvider";

const AdminGenrePage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalGenreCount, setTotalGenreCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [newGenre, setNewGenre] = useState<genreCreateUpdate>({ name: '', image: null, color: '', textColor: '' });
  const [newGenreImagePreview, setNewGenreImagePreview] = useState<string>('');
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [editingGenreImage, setEditingGenreImage] = useState<File | null>(null);
  const [editingGenreImagePreview, setEditingGenreImagePreview] = useState<string>('');
  const [editingGenreColor, setEditingGenreColor] = useState<string>('');
  const [editingGenreTextColor, setEditingGenreTextColor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteGenreId, setDeleteGenreId] = useState<string | null>(null);
  // const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [showAddGenreModal, setShowAddGenreModal] = useState(false);

  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const [saving, setSaving] = useState<boolean>(false);

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
    fetchStatistics();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        // setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      const totalCount = await getTotalActiveGenresCount();
      setTotalGenreCount(totalCount);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Có lỗi xảy ra khi lấy dữ liệu thống kê');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEditing) {
        setEditingGenreImage(file);
        setEditingGenreImagePreview(URL.createObjectURL(file));
      } else {
        setNewGenre(prev => ({ ...prev, image: file }));
        setNewGenreImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenre.name.trim()) {
      toast.error('Bạn chưa nhập tên thể loại.');
      return;
    }

    if (newGenre.name.length > 25) {
      toast.error('Tên thể loại không được vượt quá 25 ký tự!');
      return;
    }

    if (!newGenre.image) {
      toast.error('Bạn chưa chọn ảnh đại diện.');
      return;
    }

    if (!newGenre.color) {
      toast.error('Bạn chưa chọn màu sắc.');
      return;
    }

    if (!newGenre.textColor) {
      toast.error('Bạn chưa chọn màu chữ.');
      return;
    }

    setSaving(true);

    try {
      const createdGenre = await createGenre(newGenre);
      setAllGenres([...allGenres, createdGenre]);
      setGenres([...genres, createdGenre]);
      setNewGenre({ name: '', image: null, color: '', textColor: '' });
      setNewGenreImagePreview('');
      toast.success('Thêm thể loại mới thành công!');
      setShowAddGenreModal(false);
    } catch (error) {
      console.error('Error creating genre:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGenre = async () => {
    if (!editingGenre || !editingGenre.name.trim()) {
      toast.error('Bạn chưa nhập tên thể loại.');
      return;
    }

    if (editingGenre.name.length > 25) {
      toast.error('Tên thể loại không được vượt quá 25 ký tự!');
      return;
    }

    if (!editingGenreColor) {
      toast.error('Bạn chưa chọn màu sắc.');
      return;
    }

    if (!editingGenreTextColor) {
      toast.error('Bạn chưa chọn màu chữ.');
      return;
    }

    setSaving(true);

    try {
      const updatedGenre = await updateGenre(editingGenre.id, {
        name: editingGenre.name,
        image: editingGenreImage,
        color: editingGenreColor,
        textColor: editingGenreTextColor
      });
      
      const updateGenres = (list: Genre[]) => 
        list.map((genre) => (genre.id === updatedGenre.id ? updatedGenre : genre));
      
      setAllGenres(updateGenres(allGenres));
      setGenres(updateGenres(genres));
      setEditingGenre(null);
      setEditingGenreImage(null);
      setEditingGenreImagePreview('');
      setEditingGenreColor('');
      setEditingGenreTextColor('');
      toast.success('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating genre:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSaving(false);
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
    setEditingGenreImagePreview(genre.imageUrl || '');
    setEditingGenreColor(genre.color || '');
    setEditingGenreTextColor(genre.textColor || '');
    // setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingGenre(null);
    setEditingGenreImage(null);
    setEditingGenreImagePreview('');
    setEditingGenreColor('');
    setEditingGenreTextColor('');
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

  // const handleMenuToggle = (genreId: string) => {
  //   setOpenMenuId(openMenuId === genreId ? null : genreId); 
  // };

  const handleDeleteClick = (genreId: string) => {
    setIsDeleting(true);
    setDeleteGenreId(genreId);
    // setOpenMenuId(null);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">🎭 Quản lý thể loại</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddGenreModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md"
          >
            ✨ Thêm thể loại mới
          </button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl text-white hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-semibold mb-2">Tổng số thể loại</h4>
                <p className="text-4xl font-bold">{totalGenreCount}</p>
              </div>
              <div className="text-4xl">🎭</div>
            </div>
            <div className="mt-4">
              <p className="text-sm opacity-80">Thể loại đang hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="flex items-center px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="20" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
                <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
              </svg>
              <input
                type="search"
                onChange={handleSearchChange}
                value={searchQuery}
                placeholder="Tìm kiếm thể loại..."
                className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Genre list */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Danh sách thể loại</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden p-6 min-h-[180px] flex flex-col justify-between group"
              style={{ backgroundColor: genre.color || '#ffffff' }}
            >
              {/* Genre Name */}
              <div className="z-10">
                <h3 className="text-2xl font-semibold truncate" style={{ color: genre.textColor || '#ffffff' }}>{genre.name}</h3>
              </div>

              {/* Genre Image */}
              {genre.imageUrl && (
                <div className="absolute bottom-0 right-0 transform translate-x-8 translate-y-8 w-36 h-36 overflow-hidden rounded-xl rotate-12 shadow-lg">
                  <img
                    src={genre.imageUrl}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="z-20 flex gap-3 mt-6 justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditGenre(genre)}
                  className="px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors shadow-sm"
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDeleteClick(genre.id)}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Genre Modal */}
      {showAddGenreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">✨ Thêm thể loại mới</h3>
              <button
                onClick={() => setShowAddGenreModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={saving}
              >
                ✖
              </button>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={newGenre.name}
                      onChange={(e) => setNewGenre(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập tên thể loại"
                      className="flex-grow px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Màu chữ:</label>
                      <input
                        type="color"
                        value={newGenre.textColor || '#ffffff'}
                        onChange={(e) => setNewGenre(prev => ({ ...prev, textColor: e.target.value }))}
                        title="Chọn màu chữ"
                        className="w-12 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer shadow-sm"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Màu nền:</label>
                      <input
                        type="color"
                        value={newGenre.color || '#000000'}
                        onChange={(e) => setNewGenre(prev => ({ ...prev, color: e.target.value }))}
                        title="Chọn màu nền"
                        className="w-12 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer shadow-sm"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload */}
                  <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden group hover:border-blue-500 transition-colors">
                    {newGenreImagePreview ? (
                      <img
                        src={newGenreImagePreview}
                        alt="Genre preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <RiImageAddLine className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <label className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${saving ? 'cursor-not-allowed' : ''}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        className="hidden"
                        disabled={saving}
                      />
                      <span className="text-white text-sm font-medium">Chọn ảnh</span>
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="flex-1">
                    <div
                      className={`relative rounded-xl shadow-lg overflow-hidden p-6 h-48 flex flex-col justify-between w-full max-w-[400px] ${
                        newGenre.color ? '' : 'bg-white/5 dark:bg-gray-800'
                      }`}
                      style={newGenre.color ? { backgroundColor: newGenre.color } : {}}
                    >
                      {/* Genre Name */}
                      <div className="z-10">
                        <h3 className="text-2xl font-semibold truncate" style={{ color: newGenre.textColor || '#ffffff' }}>
                          {newGenre.name || 'Tên thể loại'}
                        </h3>
                      </div>

                      {/* Genre Image Preview */}
                      {(newGenreImagePreview || newGenre.image) && (
                        <div className="absolute bottom-0 right-0 transform translate-x-6 translate-y-6 w-32 h-32 overflow-hidden rounded-xl rotate-12 shadow-lg">
                          {newGenreImagePreview ? (
                            <img
                              src={newGenreImagePreview}
                              alt="Genre preview"
                              className="w-full h-full object-cover"
                            />
                          ) : newGenre.image ? (
                            <img
                              src={URL.createObjectURL(newGenre.image)}
                              alt="Genre preview"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create button */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddGenreModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGenre}
                className={`px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tạo...
                  </>
                ) : (
                  'Tạo thể loại mới'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Genre Modal */}
      {editingGenre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-[480px] shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">✏️ Chỉnh sửa thể loại</h3>
            <div className="flex flex-col gap-6 mb-6">
              <input
                type="text"
                value={editingGenre.name}
                onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
                placeholder="Nhập tên thể loại"
                className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
              />
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Màu chữ:</label>
                  <input
                    type="color"
                    value={editingGenreTextColor || '#ffffff'}
                    onChange={(e) => setEditingGenreTextColor(e.target.value)}
                    title="Chọn màu chữ"
                    className="w-12 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Màu nền:</label>
                  <input
                    type="color"
                    value={editingGenreColor || '#000000'}
                    onChange={(e) => setEditingGenreColor(e.target.value)}
                    title="Chọn màu nền"
                    className="w-12 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Image upload for editing */}
            <div className="relative w-48 h-48 mx-auto mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden group hover:border-blue-500 transition-colors">
              <img
                src={editingGenreImagePreview || editingGenre.imageUrl || ''}
                alt="Genre preview"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, true)}
                  className="hidden"
                />
                <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
              </label>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateGenre}
                className={`flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div ref={deleteModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-[400px] shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              🗑️ Xác nhận xóa
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
              Bạn có chắc chắn muốn xóa thể loại này không?
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
              >
                Hủy
              </button>
              <button
                disabled={loading}
                onClick={handleDeleteGenre}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm"
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
