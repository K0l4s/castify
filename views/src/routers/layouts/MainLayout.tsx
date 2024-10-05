import { Outlet } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"
import MainSidebar from "../../components/sidebar/MainSidebar"

const MainLayout = () => {
  return (
    <>
      <MainHeader/>
      <MainSidebar/>
      <Outlet />
    </>
  )
}

export default MainLayout