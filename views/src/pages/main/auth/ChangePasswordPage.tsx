import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateApi } from "../../../services/AuthenticateService";

const ChangePasswordPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authenticateApi.changePassword(oldPassword, newPassword, repeatNewPassword);
      navigate("/"); // chuyển về trang chủ
    } catch (err: any) {
      setError(err.response?.data || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Đổi mật khẩu</h2>

        {error && <div className="text-red-500 mb-3 text-sm text-center">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            value={repeatNewPassword}
            onChange={(e) => setRepeatNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
