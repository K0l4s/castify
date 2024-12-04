import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import CreatorLayout from './layouts/CreatorLayout'
import MainLayout from './layouts/MainLayout'
import LandingPage from '../pages/main/landingPage/LandingPage'
import AdminLadingPage from '../pages/admin/ladingPage/AdminLadingPage'
import AdminUserPage from '../pages/admin/userPage/AdminUserPage'
import CreatorLandingPage from '../pages/creator/ladingPage/CreatorLandingPage'
import NotFoundPage from '../pages/informationPage/NotFoundPage'
import NotAccessPage from '../pages/informationPage/NotAccessPage'
import ProfilePage from '../pages/main/profile/ProfilePage'
import VideoEditor from '../components/creator/videoEditor/VideoEditor'
import { useSelector } from 'react-redux'
import { Role } from '../constants/Role'
import { RootState } from '../redux/store'
import VertifyPage from '../pages/main/vertifyPage/VertifyPage'
import TermsPage from '../pages/main/policyPage/TearmsPage'
import PrivacyPolicy from '../pages/main/policyPage/PrivacyPolicy'
import MyPodcastPage from '../pages/creator/ladingPage/MyPodcastPage'
import SettingPage from '../pages/main/profile/SettingPage'
import ProfileLayout from './layouts/ProfileLayout'
import PodcastViewport from '../components/UI/podcast/PodcastViewport'
import HistoryPage from '../pages/main/historyPage/HistoryPage'
import DetailPodcastPage from '../pages/creator/ladingPage/DetailPodcastPage'

const Router = () => {
    const isAdmin = useSelector((state: RootState) => state.auth.user?.role === Role.A);
    return (
        <div className='bg-gray-200 dark:bg-gray-900'>
            <Routes>
                {/* <Route> */}
                <Route path='/login' element={<LandingPage />} />
                <Route path='/register' element={<LandingPage />} />
                <Route path='/forgot-password' element={<LandingPage />} />
                <Route path='/reset-password' element={<LandingPage />} />
                <Route path='/vertify' element={<VertifyPage />} />
                <Route path='/terms' element={<TermsPage />} />
                <Route path='/privacy' element={<PrivacyPolicy />} />
                {/* </Route> */}

                <Route path="/admin/*" element={isAdmin ? <AdminLayout /> : <NotAccessPage />}>
                    <Route path='' element={<AdminLadingPage />} />
                    <Route path="user" element={<AdminUserPage />} />
                </Route>

                <Route path='/creator/*' element={<CreatorLayout />} >
                    <Route path='' element={<CreatorLandingPage />} />
                    <Route path='contents' element={<MyPodcastPage />} />
                    <Route path='edit-podcast/:id' element={<DetailPodcastPage />} />
                    <Route path='video-editor' element={<VideoEditor />} />
                </Route>

                <Route element={<MainLayout />} >
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/feed' element={<LandingPage />} />
                    <Route path='/feed/follow' element={<LandingPage />} />
                    <Route path='/feed/trend' element={<LandingPage />} />
                    <Route path='/feed/history' element={<HistoryPage />} />
                    <Route path='/watch' element={<PodcastViewport />} />
                </Route>
                <Route element={<ProfileLayout />}>
                    <Route path='/profile' element={<ProfilePage />} />
                    <Route path='/profile/:username' element={<ProfilePage />} />
                    <Route path='/setting' element={<SettingPage />} />
                </Route>
                <Route path='*' element={<NotFoundPage />} />
            </Routes>
        </div>
    )
}

export default Router