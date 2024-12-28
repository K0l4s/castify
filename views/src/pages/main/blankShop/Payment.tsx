import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import coin from '../../../assets/images/coin.png';
import { useToast } from '../../../context/ToastProvider';
import { PaymentService } from '../../../services/PaymentService';
import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import Cookies from 'js-cookie';
const Payment = () => {
    const [selectedMethod, setSelectedMethod] = useState<string>('vnpay');
    const [amount, setAmount] = useState<number>(0);
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const toast = useToast();

    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        console.log('🔄 Khởi tạo WebSocket...');
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get('token')}`,
            },
            onConnect: () => {
                console.log('✅ WebSocket connected successfully');
                stompClient.subscribe(
                    `/user/${user?.id}/queue/payment-status`,
                    (message:any) => {
                        console.log( message.body);
                        const body = JSON.parse(message.body);
                        const status = body.status;
                        if (status === 'SUCCESS') {
                            console.log('✅ Payment status: SUCCESS');
                            toast.success('Thanh toán thành công.');
                        } else if (status === 'FAILED') {
                            console.log('❌ Payment status: FAILED');
                            toast.error('Thanh toán thất bại.');
                        } else {
                            console.log('ℹ️ Payment status:', status);
                        }
                    }
                );
            },
            onDisconnect: () => {
                console.log('❎ WebSocket disconnected');
            },
            onStompError: (frame) => {
                console.error('🚨 Broker reported error: ' + frame.headers['message']);
                console.error('📄 Additional details: ' + frame.body);
            },
            onWebSocketError: (error) => {
                console.error('🔌 WebSocket error:', error);
            }
        });
    
        stompClient.activate();
        stompClientRef.current = stompClient;
    
        return () => {
            console.log('🔄 Cleaning up WebSocket...');
            stompClient.deactivate();
        };
    }, [user]);
    

    
    const handlePayment = async () => {
        if (amount <= 0) {
            toast.error('Vui lòng chọn số tiền hợp lệ.');
            return;
        }
        try {
            const req = await PaymentService.createVNPPayment({ amount });
            if (req.status === 200) {
                const { payUrl } = req.data;
                window.open(payUrl, '_blank')?.focus();
                setPaymentStatus('PENDING');
                toast.info('Đang xử lý thanh toán...');
            }
        } catch (error) {
            toast.error('Lỗi khi tạo thanh toán.');
        }
    };

    const methods = [
        { id: 'vnpay', name: 'VNPay', logo: 'https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg' },
        { id: 'zalopay', name: 'ZaloPay', logo: 'https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg' },
        { id: 'momo', name: 'Momo', logo: 'https://homepage.momocdn.net/fileuploads/svg/momo-file-240411162904.svg' },
    ];

    return (
        <div className="min-h-screen flex items-center text-black justify-center">
            <div className="max-w-2xl m-auto p-10 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Thanh Toán</h1>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg">Hiện có:</span>
                    <span className="text-xl font-bold flex items-center">
                        {user?.coin || 0}
                        <img src={coin} alt="coin" className="w-5 h-5 ml-2" />
                    </span>
                </div>
                <div>
                    <h2 className="text-lg mb-4">Chọn phương thức thanh toán:</h2>
                    <div className="flex gap-4">
                        {methods.map(({ id, name, logo }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedMethod(id)}
                                className={`p-3 border rounded-lg flex items-center gap-2 ${
                                    selectedMethod === id ? 'border-blue-500' : 'border-gray-300'
                                }`}
                            >
                                <img src={logo} alt={name} className="w-8 h-8" />
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <h2 className="text-lg mb-2">Chọn số tiền:</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {[10000, 20000, 50000, 100000, 200000, 500000].map((value) => (
                            <button
                                key={value}
                                onClick={() => setAmount(value)}
                                className={`p-2 border rounded-md ${
                                    amount === value ? 'bg-blue-500 text-white' : 'border-gray-300'
                                }`}
                            >
                                {value.toLocaleString()} VND
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handlePayment}
                    className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Xác nhận thanh toán
                </button>
                {paymentStatus && (
                    <div className="mt-4 text-lg text-center">
                        {paymentStatus == 'SUCCESS' && <span className="text-green-500">✅ Thành công</span>}
                        {paymentStatus == 'FAILED' && <span className="text-red-500">❌ Thất bại</span>}
                        {paymentStatus == 'PENDING' && <span className="text-yellow-500">⏳ Đang chờ</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
