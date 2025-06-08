package com.castify.backend.repository;

import com.castify.backend.entity.SearchHistoryEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistoryEntity,String> {
    // Tìm search history của user theo keyword
    Optional<SearchHistoryEntity> findByUserIdAndNormalizedKeyword(String userId, String normalizedKeyword);

    // Lấy recent search history của user (30 ngày gần đây, sắp xếp theo thời gian mới nhất)
    @Query("{ 'userId': ?0, 'lastSearched': { $gte: ?1 } }")
    List<SearchHistoryEntity> findRecentByUserId(String userId, LocalDateTime since, Pageable pageable);

    // Tìm suggestions dựa trên prefix (cả user và global)
    @Query("{ 'normalizedKeyword': { $regex: '^?0', $options: 'i' } }")
    List<SearchHistoryEntity> findSuggestionsByPrefix(String prefix, Pageable pageable);

    // Cleanup old records
    void deleteByLastSearchedBefore(LocalDateTime cutoffDate);
}
