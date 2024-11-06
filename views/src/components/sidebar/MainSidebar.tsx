import { BiMeteor } from "react-icons/bi"
import { Link } from "react-router-dom"


const MainSidebar = () => {

  return (
    <>
      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 text-black  transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700
      dark:text-white
      " aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <Link to="/" className="p-3 -mx-3 transition duration-200 rounded-md flex gap-2 items-center hover:bg-gray-100 dark:hover:bg-gray-700">
                <BiMeteor />
                Push
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default MainSidebar