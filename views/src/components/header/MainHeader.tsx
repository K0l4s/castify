import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import { BiSearch } from 'react-icons/bi'

const MainHeader = () => {
  const toggleSidebar = () => {
    // document.getElementById("logo-sidebar")?.classList.remove("-translate-x-full")
    if (document.getElementById("logo-sidebar")?.classList.contains("-translate-x-full")) {
      document.getElementById("logo-sidebar")?.classList.remove("-translate-x-full")
    } else {
      document.getElementById("logo-sidebar")?.classList.add("-translate-x-full")
    }

  }
  const toggleMenuUser = () => {
    // document.getElementById("dropdown-user")?.classList.toggle("hidden")
    if (document.getElementById("dropdown-user")?.classList.contains("hidden")) {
      document.getElementById("dropdown-user")?.classList.remove("hidden")
    } else {
      document.getElementById("dropdown-user")?.classList.add("hidden")
    }
  }
  const isLogin = false;
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button onClick={toggleSidebar} type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
              </svg>
            </button>
            <Link to="/" className="flex ms-2 md:me-24">
              <img src={logo} className="h-8 me-3" alt="Castify Logo" />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Castify</span>
            </Link>
          </div>
          {/* Search bar */}
          <div className="w-4/12 me-20">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-1 pr-10 text-sm text-gray-900 placeholder-gray-500 bg-gray-100 border border-gray-100 rounded-lg focus:none focus:ring-gray-200 dark:bg-gray-700 dark:border-gray-700 dark:focus:ring-gray-600"
                placeholder="Search..."
              />
              {/* search icon */}
              <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center ms-3">
              <div>
                {isLogin ? (
                <button onClick={toggleMenuUser} type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                  <span className="sr-only">Open user menu</span>
                  <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                </button>
                ) : (
                  <Link to="/login" className="text-gray-900 bg-blue-500 p-3 rounded-xl dark:text-white">Login</Link>
                )}
              </div>
              <div className="fixed right-0 top-10 z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                <div className="px-4 py-3" role="none">
                  <p className="text-sm text-gray-900 dark:text-white" role="none">
                    Admin
                  </p>
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                    Switch to user
                  </p>
                </div>
                <ul className="py-1" role="none">
                  <li>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Dashboard</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Settings</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Earnings</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sign out</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MainHeader