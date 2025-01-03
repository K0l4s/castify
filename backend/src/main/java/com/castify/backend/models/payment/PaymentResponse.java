package com.castify.backend.models.payment;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class PaymentResponse {
    private String status;
    private String message;
    private Date timestamp;
}
