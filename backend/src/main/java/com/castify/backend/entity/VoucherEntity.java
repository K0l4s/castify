package com.castify.backend.entity;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.checkerframework.common.aliasing.qual.Unique;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "voucher")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VoucherEntity {
    @Id
    private String id;
    @NotNull
    @Unique
    private String voucherCode;
    private String voucherName;
//    private String voucherType;
    private LocalDateTime voucherStartDate;
    private LocalDateTime voucherEndDate;
    private String voucherDescription;
    private boolean isActive;
//    private List<String> frameEventIds = new ArrayList<>(); //Apply for frameEvent, if it is null - Apply all
    private Integer voucherAmount;
    private Double percent;

    private List<String> frameIds = new ArrayList<>(); //Apply for frame, if it is null - Apply all
    public boolean checkValidFrameIds(String frameId){
        if(frameIds.isEmpty())
            return true;
        return frameIds.contains(frameId);
    }

    public boolean checkValidDate(){
        if(voucherEndDate!=null && voucherStartDate!=null) {
            LocalDateTime now = LocalDateTime.now();
            return now.isAfter(voucherStartDate) && now.isBefore(voucherEndDate);
        }
        return true;
    }

    public boolean checkValidAmount(){
        if(voucherAmount!=null)
            return voucherAmount > 0;
        return true;
    }

//    public boolean checkValidEventIds(String eventId){
//        if(frameEventIds.isEmpty())
//            return true;
//        return frameEventIds.contains(eventId);
//    }

//    public boolean checkValidVoucher(){}
}
