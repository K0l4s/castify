package com.castify.backend.repository;

import com.castify.backend.entity.VoucherEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface VoucherRepository extends MongoRepository<VoucherEntity, String> {
//    VoucherEntity findByVoucherId(String voucherId);
    VoucherEntity findByVoucherCode(String voucherCode);
//    List<VoucherEntity> findByFrameEventIdsContaining(String frameEventId);
}
