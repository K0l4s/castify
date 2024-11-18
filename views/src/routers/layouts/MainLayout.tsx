import { Outlet } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"
import MainSidebar from "../../components/sidebar/MainSidebar"

const MainLayout = () => {
  return (
    <>
      <MainHeader />
      <MainSidebar />
      <div className="py-2 sm:ml-52 min-h-screen">
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout