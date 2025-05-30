import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import logo from '../../assets/images/logo.png';
import Authentication from './Authentication';
import MainSearchBar from './MainSearchBar';
import { toggleSidebar } from '../../redux/slice/sidebarSlice';
import { MdCategory } from 'react-icons/md';

const MainHeader: React.FC = () => {
  const dispatch = useDispatch();
  // const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end min-w-[220px]">
            <button
              onClick={handleToggleSidebar}
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
              </svg>
            </button>
            <Link to="/" className="flex items-center ms-2 md:me-24">
              <img src={logo} className="h-8 me-3" alt="Castify Logo" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-black dark:text-white hidden sm:inline">Blankcil</span>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center w-full max-w-2xl">
              <div className="flex-1">
                <MainSearchBar />
              </div>
              <Link 
                to="/genres" 
                className="ml-2 p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Genres"
              >
                <MdCategory className="w-6 h-6" />
              </Link>
            </div>
          </div>
          <div className="flex items-center min-w-[120px] justify-end">
            <Authentication />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainHeader;