import { Outlet } from "react-router-dom"
import MainHeader from "../../components/header/MainHeader"

const ProfileLayout = () => {
  return (
    <div>
         <MainHeader />
         <Outlet />
    </div>
  )
}

export default ProfileLayout