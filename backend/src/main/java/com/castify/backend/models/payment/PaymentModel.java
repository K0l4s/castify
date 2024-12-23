package com.castify.backend.models.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentModel {
    private long amount;
//    private String bankCode;
//    private String locale;
}
