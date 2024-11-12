
import { useNavigate } from 'react-router-dom';
import { authenticateApi } from '../../../services/AuthenticateService';
import { useToast } from '../../../context/ToastProvider';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { useDispatch } from 'react-redux';
import { login, setUser } from '../../../redux/slice/authSlice';
const VertifyPage = () => {
    // const token = useParams().token;
    // get token from url ?token=
    const token = window.location.href.split('?token=')[1];
    const toast = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const sendVertify = async () => {
        try {

            toast.loading('Logging in...');
            const res = await authenticateApi.vertify(token)

            if (!res.data) {
                throw new Error('Authentication failed');
            }

            // Set token and refresh token in cookies with secure flags
            Cookies.set('token', res.data.access_token, {
                expires: 1,
                secure: true,
                sameSite: 'strict'
            });
            Cookies.set('refreshToken', res.data.refresh_token, {
                expires: 7,
                secure: true,
                sameSite: 'strict'
            });

            // Fetch user information
            const userRes = await userService.getUser(res.data.access_token);
            const user: User = userRes.data;

            dispatch(login());
            dispatch(setUser(user));
            // toast.success('Login successful!');
            toast.info('Login successful!');
            navigate('/');

        } catch (err: any) {
            toast.error(err.message);
            navigate('/error');
            console.log(err.message);
        }
    }
    // send 1 vertify when page load
    useEffect(() => {
        sendVertify();
    }, []);
    // sendVertify();
    return <div>
        <h1>VertifyPage</h1>
    </div>;
};

export default VertifyPage;