import { Outlet } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"
import MainSidebar from "../../components/sidebar/MainSidebar"

const MainLayout = () => {
  return (
    <>
      <MainHeader />
      <MainSidebar />
      <div className="p-6 py-20 sm:ml-64 min-h-screen">
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout