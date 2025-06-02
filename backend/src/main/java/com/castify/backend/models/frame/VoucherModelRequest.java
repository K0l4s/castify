package com.castify.backend.models.frame;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoucherModelRequest {
    @NotNull
    private String id;
    @NotNull
    private String voucherCode;
    @NotNull
    private String voucherName;
    private LocalDateTime voucherStartDate;
    private LocalDateTime voucherEndDate;
    private String voucherDescription;
    private boolean isActive = true;
    private List<String> frameEventIds;
    private Integer voucherAmount;
    @NotNull
    private Double percent;
}
