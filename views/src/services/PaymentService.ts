import { axiosInstanceAuth } from "../utils/axiosInstance";

export const PaymentService = {
    createVNPPayment: async (data: {amount:number}) => {
        return await axiosInstanceAuth.post(`/api/v1/payment/vnpay`, data);
    },
    getPaymentStatus: async (orderId: string) => {
        return await axiosInstanceAuth.get(`/api/v1/payment/get-payment-status?orderId=${orderId}`);
    },
    getPaymentHistory: async (pageNumber: number, pageSize: number) => {
        return await axiosInstanceAuth.get(`/api/v1/payment/get-payment-history?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    }
}
