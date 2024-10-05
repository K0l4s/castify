import { Outlet } from "react-router-dom"
import CreatorHeader from "../../components/header/CreatorHeader"
import CreatorSidebar from "../../components/sidebar/CreatorSidebar"

const CreatorLayout = () => {
  return (
    <>
      <CreatorHeader />
      <CreatorSidebar />
      <Outlet />
    </>
  )
}

export default CreatorLayout