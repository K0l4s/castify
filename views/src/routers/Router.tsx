import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import CreatorLayout from './layouts/CreatorLayout'
import MainLayout from './layouts/MainLayout'
import LandingPage from '../pages/main/landingPage/LandingPage'
import AdminLadingPage from '../pages/admin/ladingPage/AdminLadingPage'
import AdminUserPage from '../pages/admin/userPage/AdminUserPage'
import CreatorLandingPage from '../pages/creator/ladingPage/CreatorLandingPage'
import NotFoundPage from '../pages/errorPage/NotFoundPage'
import NotAccessPage from '../pages/errorPage/NotAccessPage'
import ProfilePage from '../pages/main/profile/ProfilePage'

const Router = () => {
    const isAdmin = true; // Replace with your actual admin check logic

    return (
        <div className='bg-gray-200 dark:bg-gray-900'>
            <Routes>
                <Route>
                    <Route path='/login' element={<LandingPage />} />
                    <Route path='/register' element={<LandingPage />} />
                    <Route path='/forgot-password' element={<LandingPage />} />
                    <Route path='/reset-password' element={<LandingPage />} />
                </Route>

                <Route path="/admin/*" element={isAdmin ? <AdminLayout /> : <NotAccessPage />}>
                    <Route path='' element={<AdminLadingPage />} />
                    <Route path="users" element={<AdminUserPage />} />
                </Route>

                <Route path='/creator/*' element={<CreatorLayout />} >
                    <Route path='' element={<CreatorLandingPage />} />
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