import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/header/AdminHeader";
import AdminSidebar from "../../components/sidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <AdminSidebar />
      <div className="p-6 py-20 sm:ml-64  bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Outlet/>
      </div>
    </>
  );
};

export default AdminLayout;
