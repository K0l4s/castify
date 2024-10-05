import { Outlet } from "react-router-dom"
import CreatorHeader from "../../components/header/CreatorHeader"
import CreatorSidebar from "../../components/sidebar/CreatorSidebar"

const CreatorLayout = () => {
  return (
    <>
      <CreatorHeader />
      <CreatorSidebar />
      <div className="p-6 py-20 sm:ml-64">
      <Outlet />
      </div>
    </>
  )
}

export default CreatorLayout