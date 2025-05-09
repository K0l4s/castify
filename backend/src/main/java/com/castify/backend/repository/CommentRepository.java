package com.castify.backend.repository;

import com.castify.backend.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository  extends MongoRepository<CommentEntity, String> {
    // Find comments with likes for Popular Sort.
    @Aggregation(pipeline = {
            "{ $match: { 'podcast.$id': ObjectId(?0), 'parentId': null } }", // Lọc theo podcast ID
            "{ $lookup: { from: 'commentLike', localField: '_id', foreignField: 'commentEntity.$id', as: 'likes' } }", // Join với collection `commentLike`
            "{ $addFields: { likeCount: { $size: '$likes' } } }", // Tính tổng số `like`
            "{ $group: { _id: '$_id', doc: { $first: '$$ROOT' } } }", // Loại bỏ bản ghi trùng lặp
            "{ $replaceRoot: { newRoot: '$doc' } }", // Trả kết quả về định dạng gốc
            "{ $sort: { ?1: ?2 } }", // Sắp xếp
            "{ $skip: ?3 }", // Bỏ qua (phân trang)
            "{ $limit: ?4 }" // Giới hạn số lượng (phân trang)
    })
    List<CommentEntity> findCommentsWithLikes(String podcastId, String sortField, int sortDirection, int skip, int limit);
    List<CommentEntity> findByParentId(String parentId);
//    Page<CommentEntity> findByPodcastId(String podcastId, Pageable pageable);
    List<CommentEntity> findByPodcastId(String podcastId);
    long countByPodcastId(String podcastId);
    Page<CommentEntity> findByPodcastIdAndParentIdIsNull(String podcastId, Pageable pageable);
    List<CommentEntity> findAllByParentId(String parentId);
}
