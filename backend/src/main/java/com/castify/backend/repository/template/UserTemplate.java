package com.castify.backend.repository.template;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.user.FollowInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class UserTemplate {
    @Autowired
    private MongoTemplate mongoTemplate;

    public Page<UserEntity> findSimilarUsers(UserEntity currentUser, Pageable pageable) {
        Criteria criteria = new Criteria();

        // Loại bỏ chính người dùng khỏi kết quả
        criteria.and("_id").ne(currentUser.getId());

        // Tạo một danh sách các điều kiện (cho phép sử dụng OR nếu không có điều kiện nào đúng)
        List<Criteria> conditions = new ArrayList<>();

        // Kiểm tra và thêm điều kiện cho provinces nếu giá trị không phải là null
        if (currentUser.getProvinces() != null && !currentUser.getProvinces().isEmpty()) {
            conditions.add(Criteria.where("provinces").regex("^" + currentUser.getProvinces().trim(), "i"));
        }

        // Kiểm tra và thêm điều kiện cho district nếu giá trị không phải là null
        if (currentUser.getDistrict() != null && !currentUser.getDistrict().isEmpty()) {
            conditions.add(Criteria.where("district").regex("^" + currentUser.getDistrict().trim(), "i"));
        }

        // Kiểm tra và thêm điều kiện cho ward nếu giá trị không phải là null
        if (currentUser.getWard() != null && !currentUser.getWard().isEmpty()) {
            conditions.add(Criteria.where("ward").regex("^" + currentUser.getWard().trim(), "i"));
        }

        // Kiểm tra điều kiện theo năm sinh (chỉ lấy người sinh cùng năm)
        if (currentUser.getBirthday() != null) {
            int birthYear = currentUser.getBirthday().getYear();
            conditions.add(Criteria.where("birthday").regex("^" + birthYear)); // Lọc theo năm sinh
        }

        // Kiểm tra các điều kiện theo người theo dõi (following)
        if (currentUser.getFollowing() != null && !currentUser.getFollowing().isEmpty()) {
            conditions.add(Criteria.where("following").in(currentUser.getFollowing()));
        }

        // Nếu có bất kỳ điều kiện nào, kết hợp chúng với "OR"
        if (!conditions.isEmpty()) {
            criteria.orOperator(conditions.toArray(new Criteria[0]));
        }

        // Tạo truy vấn với các điều kiện đã được xây dựng
        Query query = new Query(criteria);

        // Áp dụng phân trang và sắp xếp (nếu cần)
        query.with(pageable);

//        // Thực thi truy vấn và lấy kết quả
//        List<UserEntity> users = mongoTemplate.find(query, UserEntity.class);
//        Set<String> followingSet = new HashSet<>(currentUser.getFollowing());
        // Lấy danh sách ID của following từ FollowingInfo
        Set<String> followingSet = currentUser.getFollowing()
                .stream()
                .map(FollowInfo::getUserId) // Lấy trường `id` từ từng FollowingInfo
                .collect(Collectors.toSet());

// Thực thi truy vấn và lấy kết quả
        List<UserEntity> users = mongoTemplate.find(query, UserEntity.class);


        List<UserEntity> resultUser = users.stream()
                .filter(userEntity -> !followingSet.contains(userEntity.getId()))
                .collect(Collectors.toList());
        // Kiểm tra nếu không có kết quả, lấy ngẫu nhiên
        if (users.isEmpty()) {
            // Lấy ngẫu nhiên các người dùng từ database nếu không tìm thấy ai khớp
            query = new Query();
            long totalCount = mongoTemplate.count(query, UserEntity.class);

            if (totalCount > 0) {
                // Random một người dùng (hoặc n người dùng)
                int randomSkip = new Random().nextInt((int) totalCount);
                query.skip(randomSkip).limit(pageable.getPageSize());
                resultUser = mongoTemplate.find(query, UserEntity.class);
            }
        }

        // Tính toán tổng số kết quả
        long totalCount = mongoTemplate.count(query, UserEntity.class);

        // Trả về Page chứa kết quả phân trang
        return new PageImpl<>(resultUser, pageable, totalCount);
    }


    public Page<UserEntity> findByKeywordWithAggregation(String keyword, Pageable pageable) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(
                        new Criteria().orOperator(
                                // Tìm kiếm cho các trường đầu tên, giữa tên, và cuối tên riêng biệt
                                Criteria.where("firstName").regex(keyword, "i"),
                                Criteria.where("middleName").regex(keyword, "i"),
                                Criteria.where("lastName").regex(keyword, "i"),
                                Criteria.where("ward").regex(keyword, "i"),
                                Criteria.where("provinces").regex(keyword, "i"),
                                Criteria.where("district").regex(keyword, "i"),
                                Criteria.where("username").regex(keyword,"i"),
                                // Kết hợp lastName + middleName + firstName để tìm kiếm với chuỗi đầy đủ
                                Criteria.where("lastName").regex(".*" + keyword + ".*", "i")
                                        .and("middleName").regex(".*" + keyword + ".*", "i")
                                        .and("firstName").regex(".*" + keyword + ".*", "i")
                        )
                ),
                Aggregation.skip((long) pageable.getOffset()),
                Aggregation.limit(pageable.getPageSize())
        );

        AggregationResults<UserEntity> results = mongoTemplate.aggregate(aggregation, "user", UserEntity.class);
        return new PageImpl<>(results.getMappedResults(), pageable, results.getMappedResults().size());
    }


}
