
import { authenticateApi } from '../../../services/AuthenticateService';
import { useToast } from '../../../context/ToastProvider';
import { useEffect, useState } from 'react';

const VertifyPage = () => {
    const token = window.location.href.split('?token=')[1];
    const toast = useToast();
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

    const sendVertify = async () => {
        try {
            toast.loading('Verifying email...');
            const res = await authenticateApi.vertify(token);

            if (!res.data) {
                throw new Error('Verification failed');
            }

            setVerificationStatus('success');
            toast.success('Email verified successfully!');
            setTimeout(() => {
                // navigate('/login');
            }, 2000);

        } catch (err: any) {
            setVerificationStatus('error');
            toast.error(err.message);
            setTimeout(() => {
                // navigate('/error');
            }, 2000);
            console.log(err.message);
        }
    }

    useEffect(() => {
        if (token) {
            sendVertify();
        }
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
             style={{
                 background: 'linear-gradient(180deg, #006994 0%, #003366 100%)'
             }}>
            {/* Animated sea creatures */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="animate-swim1 absolute" style={{ left: '10%', top: '20%' }}>
                    <div className="text-4xl ">🐠</div>
                </div>
                <div className="animate-swim2 absolute" style={{ right: '15%', top: '40%' }}>
                    <div className="text-5xl ">🐋</div>
                </div>
                <div className="animate-swim3 absolute" style={{ left: '20%', bottom: '30%' }}>
                    <div className="text-3xl ">🐟</div>
                </div>
                <div className="animate-swim4 absolute" style={{ right: '25%', bottom: '20%' }}>
                    <div className="text-4xl ">🐡</div>
                </div>
                <div className="animate-swim5 absolute" style={{ left: '40%', top: '15%' }}>
                    <div className="text-3xl ">🦈</div>
                </div>
            </div>

            {/* Bubbles effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="animate-bubble1 absolute bg-white/20 rounded-full w-4 h-4" style={{ left: '10%', bottom: '0' }}></div>
                <div className="animate-bubble2 absolute bg-white/20 rounded-full w-6 h-6" style={{ left: '30%', bottom: '0' }}></div>
                <div className="animate-bubble3 absolute bg-white/20 rounded-full w-3 h-3" style={{ left: '50%', bottom: '0' }}></div>
                <div className="animate-bubble4 absolute bg-white/20 rounded-full w-5 h-5" style={{ left: '70%', bottom: '0' }}></div>
                <div className="animate-bubble5 absolute bg-white/20 rounded-full w-4 h-4" style={{ left: '90%', bottom: '0' }}></div>
            </div>

            <div className="bg-cyan-900/80 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md w-full relative z-10 border-2 border-cyan-500/30">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-cyan-100 mb-2 drop-shadow-lg">Email Verification</h1>
                    {verificationStatus === 'pending' && (
                        <p className="text-cyan-200">Verifying your email address...</p>
                    )}
                    {verificationStatus === 'success' && (
                        <p className="text-emerald-300">Email verified successfully! Please wait while we redirect you.</p>
                    )}
                    {verificationStatus === 'error' && (
                        <p className="text-red-300">Verification failed. Please try again.</p>
                    )}
                </div>

                <div className="flex justify-center">
                    {verificationStatus === 'pending' && (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-transparent"></div>
                    )}
                    {verificationStatus === 'success' && (
                        <div className="bg-emerald-400/20 p-3 rounded-full">
                            <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                    {verificationStatus === 'error' && (
                        <div className="bg-red-400/20 p-3 rounded-full">
                            <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes swim1 {
                    0% { transform: translate(0, 0) scaleX(-1); }
                    25% { transform: translate(30vw, 20vh) scaleX(-1); }
                    50% { transform: translate(30vw, 20vh) scaleX(1); }
                    75% { transform: translate(0, 0) scaleX(1); }
                    100% { transform: translate(0, 0) scaleX(-1); }
                }
                @keyframes swim2 {
                    0% { transform: translate(0, 0) scaleX(1); }
                    25% { transform: translate(-20vw, -10vh) scaleX(1); }
                    50% { transform: translate(-20vw, -10vh) scaleX(-1); }
                    75% { transform: translate(0, 0) scaleX(-1); }
                    100% { transform: translate(0, 0) scaleX(1); }
                }
                @keyframes swim3 {
                    0% { transform: translate(0, 0) scaleX(-1); }
                    25% { transform: translate(25vw, -15vh) scaleX(-1); }
                    50% { transform: translate(25vw, -15vh) scaleX(1); }
                    75% { transform: translate(0, 0) scaleX(1); }
                    100% { transform: translate(0, 0) scaleX(-1); }
                }
                @keyframes swim4 {
                    0% { transform: translate(0, 0) scaleX(1); }
                    25% { transform: translate(-15vw, 25vh) scaleX(1); }
                    50% { transform: translate(-15vw, 25vh) scaleX(-1); }
                    75% { transform: translate(0, 0) scaleX(-1); }
                    100% { transform: translate(0, 0) scaleX(1); }
                }
                @keyframes swim5 {
                    0% { transform: translate(0, 0) scaleX(-1); }
                    25% { transform: translate(20vw, 10vh) scaleX(-1); }
                    50% { transform: translate(20vw, 10vh) scaleX(1); }
                    75% { transform: translate(0, 0) scaleX(1); }
                    100% { transform: translate(0, 0) scaleX(-1); }
                }
                @keyframes bubble {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    50% { transform: translateY(-50vh) scale(1.2); opacity: 1; }
                    100% { transform: translateY(-100vh) scale(1); opacity: 0; }
                }
                .animate-swim1 { animation: swim1 15s infinite ease-in-out; }
                .animate-swim2 { animation: swim2 20s infinite ease-in-out; }
                .animate-swim3 { animation: swim3 18s infinite ease-in-out; }
                .animate-swim4 { animation: swim4 25s infinite ease-in-out; }
                .animate-swim5 { animation: swim5 22s infinite ease-in-out; }
                .animate-bubble1 { animation: bubble 8s infinite ease-out; }
                .animate-bubble2 { animation: bubble 10s infinite ease-out; }
                .animate-bubble3 { animation: bubble 7s infinite ease-out; }
                .animate-bubble4 { animation: bubble 9s infinite ease-out; }
                .animate-bubble5 { animation: bubble 11s infinite ease-out; }
            `}</style>
        </div>
    );
};

export default VertifyPage;