package com.castify.backend.utils;
import com.castify.backend.service.payment.vnPay.VNPayPaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

public class VNPayUtils {
    private static final Logger logger = LoggerFactory.getLogger(VNPayUtils.class);

    public static String generateVNPayUrl(Map<String, String> params, String secretKey) throws Exception {
        // Sắp xếp tham số theo thứ tự từ điển
        SortedMap<String, String> sortedParams = new TreeMap<>(params);

        // Tạo chuỗi query và hash
        StringBuilder query = new StringBuilder();
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                    .append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                    .append("&");
            hashData.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
        }
        query.deleteCharAt(query.length() - 1); // Xóa ký tự `&` cuối cùng
        hashData.deleteCharAt(hashData.length() - 1);

        // Tạo chữ ký SHA256
        String secureHash = hmacSHA256(secretKey, hashData.toString());

        // Thêm chữ ký vào query
        query.append("&vnp_SecureHash=").append(secureHash);
        return query.toString();
    }

    private static String hmacSHA256(String secretKey, String data) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
