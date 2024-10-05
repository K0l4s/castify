import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/header/AdminHeader";
import AdminSidebar from "../../components/sidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <AdminSidebar />
      <div className="p-6 py-20 sm:ml-64">
      <Outlet/>
      </div>
    </>
  );
};

export default AdminLayout;
