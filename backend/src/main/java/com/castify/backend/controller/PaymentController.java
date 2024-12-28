package com.castify.backend.controller;

import com.castify.backend.entity.TransactionEntity;
import com.castify.backend.models.payment.PaymentModel;
import com.castify.backend.models.payment.PaymentResponse;
import com.castify.backend.service.payment.vnPay.VNPayPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {
    @Autowired
    private VNPayPaymentService vnPayPaymentService;

    private static final Logger logger = Logger.getLogger(PaymentController.class.getName());

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/vnpay")
    public ResponseEntity<Map<String, String>> createVNPayPayment(@RequestBody PaymentModel request, HttpServletRequest req) {
        try {
            String payUrl = vnPayPaymentService.createPayment(request.getAmount(), req);
            Map<String, String> response = new HashMap<>();
            response.put("payUrl", payUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.warning("Error during payment creation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/payment_callback")
    public ResponseEntity<String> handlePaymentCallback(HttpServletRequest request) {
        try {
            TransactionEntity trans = vnPayPaymentService.callbackTransaction(request);

            if (trans != null && trans.getUserId() != null) {
                // Thêm logging để debug
                logger.info("Sending payment status to user: " + trans.getUserId());
                logger.info("Status: " + trans.getStatus().toString());

                // Sử dụng convertAndSendToUser với destination đầy đủ
                messagingTemplate.convertAndSendToUser(
                        trans.getUserId(), // Đảm bảo chuyển sang String
                        "/queue/payment-status",
                        PaymentResponse.builder()
                                .status(trans.getStatus().toString())
                                .message("Payment status updated")
                                .timestamp(new Date())
                                .build()
                );
                logger.info(trans.getUserId());
                return ResponseEntity.ok("Payment status updated: " + trans.getStatus());
            } else {
                logger.warning("Invalid transaction data received");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid transaction data");
            }
        } catch (Exception e) {
            logger.severe("Error during callback handling: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Callback processing failed");
        }
    }


}
