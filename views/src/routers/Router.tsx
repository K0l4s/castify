
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import CreatorLayout from './layouts/CreatorLayout'
import MainLayout from './layouts/MainLayout'
import LandingPage from '../pages/main/landingPage/LandingPage'
import AdminLadingPage from '../pages/admin/ladingPage/AdminLadingPage'
import AdminUserPage from '../pages/admin/userPage/AdminUserPage'
import CreatorLandingPage from '../pages/creator/ladingPage/CreatorLandingPage'
import NotFoundPage from '../pages/404/NotFoundPage'
import ProfilePage from '../pages/main/profile/ProfilePage'
const Router = () => {
    return (
        <div className='bg-gray-200 dark:bg-gray-900'>
            <Routes>
                <Route>

                    <Route path='/login' element={<LandingPage />} />
                    <Route path='/register' element={<LandingPage />} />
                    <Route path='/forgot-password' element={<LandingPage />} />
                    <Route path='/reset-password' element={<LandingPage />} />
                </Route>

                <Route element={<AdminLayout />} >
                    <Route path='/admin' element={<AdminLadingPage />} />
                    <Route path="/admin/users" element={<AdminUserPage />} />
                </Route>

                <Route element={<CreatorLayout />} >
                    <Route path='/creator/' element={<CreatorLandingPage />} />
                </Route>

                <Route element={<MainLayout />} >
                    <Route path='/' element={<LandingPage />} />
                </Route>
                <Route path='/profile/*' element={<ProfilePage />} />
                <Route path='*' element={<NotFoundPage />} />
            </Routes>
        </div>
    )
}

export default Router