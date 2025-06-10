package com.castify.backend.models.frame;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoucherModel {
    private String voucherCode;
    private String voucherName;
    private String voucherDescription;
    private Double percent;
}
