import { Outlet } from "react-router-dom"
import CreatorHeader from "../../components/header/CreatorHeader"
import CreatorSidebar from "../../components/sidebar/CreatorSidebar"

const CreatorLayout = () => {

  return (
    <>
      <CreatorHeader />
      <CreatorSidebar />
      <div className="p-6 py-20 sm:ml-64 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-colors duration-500">
      <Outlet />
      </div>
    </>
  )
}

export default CreatorLayout