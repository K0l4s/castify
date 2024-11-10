import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import AuthenticationModal from '../modals/authentication/AuthenticationModal'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const MainHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    const sidebar = document.getElementById("logo-sidebar");
    sidebar?.classList.toggle("-translate-x-full");
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    const dropdown = document.getElementById("dropdown-user");
    dropdown?.classList.toggle("hidden");
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  }

  const handleSearchFocus = () => {
    if (searchQuery) {
      setShowSearchResults(true);
    }
  }

  const handleSearchBlur = () => {
    // Small delay to allow clicking search results
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button 
                onClick={toggleSidebar}
                type="button" 
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
              </button>
              <Link to="/" className="flex items-center ms-2 md:me-24">
                <img src={logo} className="h-8 me-3" alt="Castify Logo" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-black dark:text-white">Castify</span>
              </Link>
            </div>

            <div className="relative flex-1 max-w-xl mx-4">
              <div className="flex items-center px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3">
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input 
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search podcasts, episodes, creators..."
                  className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400"
                  aria-label="Search"
                  data-testid="search-input"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  ⌘K
                </kbd>
              </div>
              {showSearchResults && (
                <div className="absolute inset-x-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" data-testid="search-results">
                  <div className="p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recent searches</div>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer" data-testid="search-result-item">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tech Talks Daily</span>
                      </div>
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer" data-testid="search-result-item">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">The AI Revolution</span>
                      </div>
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer" data-testid="search-result-item">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Startup Stories</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <div className="relative ms-3">
                {isAuth ? (
                  <button
                    onClick={toggleUserMenu}
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="User avatar" />
                  </button>
                ) : (
                  <button 
                    onClick={handleOpen}
                    className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
                  >
                    Login
                  </button>
                )}

                <div className={`fixed right-0 top-10 z-50 ${isUserMenuOpen ? '' : 'hidden'} my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600`} id="dropdown-user">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">Admin</p>
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">Switch to user</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Settings</Link>
                    </li>
                    <li>
                      <Link to="/earnings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</Link>
                    </li>
                    <li>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthenticationModal isLogin={true} isOpen={isOpen} onClose={handleClose} />
    </>
  )
}

export default MainHeader