import { BiSolidVideos } from "react-icons/bi"
import { HiMiniUserGroup } from "react-icons/hi2"
import { MdOutlineAnalytics, MdOutlineDashboard } from "react-icons/md"
import { Link } from "react-router-dom"

const CreatorSidebar = () => {
  return (
    <>
    <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link to="/creator/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <MdOutlineDashboard size={24} />
              <span className="ms-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/creator/analytics" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <MdOutlineAnalytics size={24} />
              <span className="flex-1 ms-3 whitespace-nowrap">Analytics</span>
              <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span>
            </Link>
          </li>
          
          <li>
            <Link to="/creator/contents" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <BiSolidVideos size={24} />
              <span className="flex-1 ms-3 whitespace-nowrap">My Podcasts</span>
            </Link>
          </li>
          <li>
            <Link to="/creator/followers" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <HiMiniUserGroup size={24} />
              <span className="flex-1 ms-3 whitespace-nowrap">Followers</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  </>
  )
}

export default CreatorSidebar