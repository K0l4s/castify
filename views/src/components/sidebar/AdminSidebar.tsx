import { AiOutlineDashboard } from "react-icons/ai";
import { FaUsersCog } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { FaRegListAlt } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { MdOutlineFilterFrames } from "react-icons/md";
import { BsCalendar2Event } from "react-icons/bs";



const AdminSidebar = () => {
  const childrenClass = "gap-2 flex items-center block py-2.5 px-4 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
  return (
    <>
      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <Link to="/admin/dashboard"
                className={childrenClass}>
                <AiOutlineDashboard />
                Dashboard</Link>
              <Link to="/admin/user"
                className={childrenClass}>
                <FaUsersCog />
                User Management</Link>
              {/* <Link to="/admin/podcast"
                className={childrenClass}>
                <PiApplePodcastsLogoFill />
                Podcast Management</Link> */}
              <Link to="/admin/report"
                className={childrenClass}>
                <TbReport />
                Report Management</Link>
              <Link to="/admin/genre"
                className={childrenClass}>
                <FaRegListAlt />
                Genre Management
              </Link>
              <Link to="/admin/frame"
                className={childrenClass}>
                <MdOutlineFilterFrames />
                Frame Management
              </Link>
              <Link to="/admin/event"
                className={childrenClass}>
                <BsCalendar2Event />
                Event Management
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
};

export default AdminSidebar