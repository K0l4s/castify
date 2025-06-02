package com.castify.backend.models.frame;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.checkerframework.common.aliasing.qual.Unique;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateVoucherRequest {
    private String id;
    private String voucherCode;
    private String voucherName;
    private LocalDateTime voucherStartDate;
    private LocalDateTime voucherEndDate;
    private String voucherDescription;
    private boolean isActive;
    private List<String> frameEventIds; 
    private Integer voucherAmount;
    private Double percent;
}
