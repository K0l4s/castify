package com.castify.backend.repository.template;

import com.castify.backend.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Repository
public class UserRepositoryTemplate {
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

        // Thực thi truy vấn và lấy kết quả
        List<UserEntity> users = mongoTemplate.find(query, UserEntity.class);

        // Kiểm tra nếu không có kết quả, lấy ngẫu nhiên
        if (users.isEmpty()) {
            // Lấy ngẫu nhiên các người dùng từ database nếu không tìm thấy ai khớp
            query = new Query();
            long totalCount = mongoTemplate.count(query, UserEntity.class);

            if (totalCount > 0) {
                // Random một người dùng (hoặc n người dùng)
                int randomSkip = new Random().nextInt((int) totalCount);
                query.skip(randomSkip).limit(pageable.getPageSize());
                users = mongoTemplate.find(query, UserEntity.class);
            }
        }

        // Tính toán tổng số kết quả
        long totalCount = mongoTemplate.count(query, UserEntity.class);

        // Trả về Page chứa kết quả phân trang
        return new PageImpl<>(users, pageable, totalCount);
    }
}
