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
    <>
      <MainHeader />
      <MainSidebar />

      <div className={`py-2 min-h-screen duration-300 ease-in-out ${isOpenSideBar ? "ml-60" : "ml-[100px]"} max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-11`}>
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout
