import { Outlet } from "react-router-dom"
import AdminHeader from "../../components/header/AdminHeader"
import AdminSidebar from "../../components/sidebar/AdminSidebar"

const CreatorLayout = () => {
  return (
    <>
      <AdminHeader/>
      <AdminSidebar/>
      <Outlet />
    </>
  )
}

export default CreatorLayout