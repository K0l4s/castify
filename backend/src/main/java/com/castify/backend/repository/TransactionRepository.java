package com.castify.backend.repository;

import com.castify.backend.entity.TransactionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends MongoRepository<TransactionEntity, String> {
    TransactionEntity findTransactionEntityById(String userId);
}
