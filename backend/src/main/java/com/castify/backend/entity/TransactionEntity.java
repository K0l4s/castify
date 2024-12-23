package com.castify.backend.entity;

import com.castify.backend.enums.PaymentType;
import com.castify.backend.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "transaction")
@AllArgsConstructor
@Data
@NoArgsConstructor
public class TransactionEntity {
    @Id
    private String id;
//    private String transactionId;
    private String userId;
    private PaymentType paymentType;
    private long amount;
    private TransactionStatus status;
    private LocalDateTime createdDate;
    private boolean processed;

}
