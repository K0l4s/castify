import { Outlet } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"
import MainSidebar from "../../components/sidebar/MainSidebar"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"

const MainLayout = () => {
  const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen)

  return (
    <>
      <MainHeader />
      <MainSidebar />
      <div className={`py-2 min-h-screen duration-300 ease-in-out ${isOpenSideBar ? "ml-60" : "ml-[100px]"}`}>
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout
