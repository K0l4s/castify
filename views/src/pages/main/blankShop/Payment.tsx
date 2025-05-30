import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import coin from '../../../assets/images/coin.png';
import { useToast } from '../../../context/ToastProvider';
import { PaymentService } from '../../../services/PaymentService';
import useStomp from '../../../hooks/useStomp';
import CustomModal from '../../../components/UI/custom/CustomModal';
interface PaymentProps {
    isOpen: boolean;
    onClose: () => void;
}
const Payment = (p: PaymentProps) => {
    const [selectedMethod, setSelectedMethod] = useState<string>('vnpay');
    const [amount, setAmount] = useState<number>(0);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const toast = useToast();
    const object = useStomp({
        subscribeUrl: `/user/${user?.id}/queue/payment-status`,
        trigger: [user],
        flag: true,
    });
    useEffect(() => {
        if (object) {
            const status = object.status;
            if (status === 'SUCCESS') {
                setPaymentStatus('SUCCESS');
                toast.success('Thanh toán thành công.');
            } else if (status === 'FAILED') {
                setPaymentStatus('FAILED');
                toast.error('Thanh toán thất bại.');
            } else {
                // setPaymentStatus(null);
            }
        }
    }, [object, toast]);

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

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCustomAmount(value);
        setAmount(Number(value));
    };

    const methods = [
        { id: 'vnpay', name: 'VNPay', logo: 'https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg' },
        // { id: 'zalopay', name: 'ZaloPay', logo: 'https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg' },
        // { id: 'momo', name: 'Momo', logo: 'https://homepage.momocdn.net/fileuploads/svg/momo-file-240411162904.svg' },
    ];
    return (
        <CustomModal title='Thanh Toán' isOpen={p.isOpen} onClose={p.onClose}>
            <div className="max-w-2xl m-auto p-10">
                {/* <h1 className="text-2xl font-bold mb-6 text-center">Thanh Toán</h1> */}
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
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {[10000, 20000, 50000, 100000, 200000, 500000].map((value) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setAmount(value);
                                    setCustomAmount('');
                                }}
                                className={`p-2 border rounded-md ${
                                    amount === value && !customAmount ? 'bg-blue-500 text-white' : 'border-gray-300'
                                }`}
                            >
                                {value.toLocaleString()} VND
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Nhập số tiền khác (VNĐ)"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="p-2 border rounded-md w-full"
                        />
                        <span className="text-gray-500">VNĐ</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                        Quy đổi: <span className="font-semibold">{Math.floor(amount / 1000)}</span> xu blank xu
                    </div>
                </div>
                <button
                    onClick={handlePayment}
                    className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Xác nhận thanh toán
                </button>
                {/* <button
                    onClick={() => window.history.back()}
                    className="w-full mt-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
                >
                    Quay lại
                </button> */}
                {paymentStatus && (
                    <div className="mt-4 text-lg text-center">
                        {paymentStatus == 'SUCCESS' && <span className="text-green-500">✅ Thành công</span>}
                        {paymentStatus == 'FAILED' && <span className="text-red-500">❌ Thất bại</span>}
                        {paymentStatus == 'PENDING' && <span className="text-yellow-500">⏳ Đang chờ</span>}
                    </div>
                )}
            </div>
        </CustomModal>
    );
};

export default Payment;

