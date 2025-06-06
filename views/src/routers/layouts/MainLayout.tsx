import { Outlet, useLocation } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"
import MainSidebar from "../../components/sidebar/MainSidebar"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { useEffect } from "react"
import { trackService } from "../../services/TrackingService"

const MainLayout = () => {
  const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen)
  const location = useLocation();

  useEffect(() => {
    trackService.trackVisitor(location.pathname);
  }, [location.pathname]); // Gửi request mỗi khi URL thay đổi
  return (
   <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden w-full">
  <MainHeader />
  <div className="flex w-full">
    <MainSidebar />
    <div
      className={`py-2 min-h-screen duration-300 ease-in-out px-4 sm:px-2 lg:px-3 max-w-full w-full ${
        isOpenSideBar ? 'ml-60' : 'ml-10'
      }`}
    >
      <Outlet />
    </div>
  </div>
</div>

  )
}

export default MainLayout
