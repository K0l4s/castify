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
        // ✅ Cải thiện search để handle multi-word better
        List<UserEntity> allResults = new ArrayList<>();
        Set<String> addedIds = new HashSet<>();

        // 1. Exact username match (highest priority)
        Query exactUsernameQuery = new Query(Criteria.where("username").is(keyword));
        List<UserEntity> exactUsername = mongoTemplate.find(exactUsernameQuery, UserEntity.class);
        exactUsername.forEach(user -> {
            allResults.add(user);
            addedIds.add(user.getId());
        });

        // 2. Get all users that might match any part of the keyword
        String[] keywords = keyword.toLowerCase().trim().split("\\s+");

        // Build OR criteria for each word in the search term
        List<Criteria> orCriteria = new ArrayList<>();
        for (String word : keywords) {
            orCriteria.add(Criteria.where("firstName").regex(".*" + word + ".*", "i"));
            orCriteria.add(Criteria.where("middleName").regex(".*" + word + ".*", "i"));
            orCriteria.add(Criteria.where("lastName").regex(".*" + word + ".*", "i"));
            orCriteria.add(Criteria.where("username").regex(".*" + word + ".*", "i"));
        }

        Query broadQuery = new Query(
                new Criteria().orOperator(orCriteria.toArray(new Criteria[0]))
                        .and("_id").nin(addedIds)
        );

        List<UserEntity> candidates = mongoTemplate.find(broadQuery, UserEntity.class);

        // ✅ Filter candidates using improved matching logic
        List<UserEntity> matchedUsers = candidates.stream()
                .filter(user -> advancedMatchesKeyword(user, keyword))
                .sorted((u1, u2) -> {
                    // Sort by relevance
                    int score1 = calculateMatchScore(u1, keyword);
                    int score2 = calculateMatchScore(u2, keyword);

                    if (score1 != score2) {
                        return Integer.compare(score2, score1); // Higher score first
                    }

                    return u1.getUsername().compareToIgnoreCase(u2.getUsername());
                })
                .collect(Collectors.toList());

        allResults.addAll(matchedUsers);

        // Apply pagination
        int totalElements = allResults.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), totalElements);

        List<UserEntity> paginatedUsers = allResults.subList(start, end);

        return new PageImpl<>(paginatedUsers, pageable, totalElements);
    }

    // ✅ Improved matching logic for multi-word search
    private boolean advancedMatchesKeyword(UserEntity user, String keyword) {
        String lowerKeyword = keyword.toLowerCase().trim();

        // 1. Check exact match with any single field
        if (containsIgnoreCase(user.getFirstName(), lowerKeyword) ||
                containsIgnoreCase(user.getMiddleName(), lowerKeyword) ||
                containsIgnoreCase(user.getLastName(), lowerKeyword) ||
                containsIgnoreCase(user.getUsername(), lowerKeyword)) {
            return true;
        }

        // 2. Check full name exact match
        String fullName = user.getFullname();
        if (containsIgnoreCase(fullName, lowerKeyword)) {
            return true;
        }

        // ✅ 3. Check if all words in keyword exist somewhere in user's name
        String[] searchWords = lowerKeyword.split("\\s+");
        if (searchWords.length > 1) {
            String combinedText = (
                    (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getMiddleName() != null ? user.getMiddleName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "") + " " +
                            (user.getUsername() != null ? user.getUsername() : "") + " " +
                            (fullName != null ? fullName : "")
            ).toLowerCase();

            // Check if ALL words from search exist in combined text
            for (String word : searchWords) {
                if (!combinedText.contains(word)) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    // ✅ Calculate match score for better sorting
    private int calculateMatchScore(UserEntity user, String keyword) {
        String lowerKeyword = keyword.toLowerCase().trim();
        int score = 0;

        // Exact username match = highest score
        if (user.getUsername() != null && user.getUsername().toLowerCase().equals(lowerKeyword)) {
            score += 100;
        }

        // Full name exact match = high score
        String fullName = user.getFullname();
        if (fullName != null && fullName.toLowerCase().equals(lowerKeyword)) {
            score += 90;
        }

        // Full name contains = medium score
        if (fullName != null && fullName.toLowerCase().contains(lowerKeyword)) {
            score += 50;
        }

        // Individual field exact matches
        if (user.getFirstName() != null && user.getFirstName().toLowerCase().equals(lowerKeyword)) {
            score += 80;
        }
        if (user.getLastName() != null && user.getLastName().toLowerCase().equals(lowerKeyword)) {
            score += 80;
        }

        // Individual field contains
        if (containsIgnoreCase(user.getFirstName(), lowerKeyword)) score += 30;
        if (containsIgnoreCase(user.getLastName(), lowerKeyword)) score += 30;
        if (containsIgnoreCase(user.getMiddleName(), lowerKeyword)) score += 20;
        if (containsIgnoreCase(user.getUsername(), lowerKeyword)) score += 40;

        // ✅ Multi-word bonus: if all words match, add bonus points
        String[] searchWords = lowerKeyword.split("\\s+");
        if (searchWords.length > 1) {
            String combinedText = (
                    (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getMiddleName() != null ? user.getMiddleName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "") + " " +
                            fullName
            ).toLowerCase();

            int wordMatches = 0;
            for (String word : searchWords) {
                if (combinedText.contains(word)) {
                    wordMatches++;
                }
            }

            if (wordMatches == searchWords.length) {
                score += 60; // Bonus for matching all words
            }
        }

        return score;
    }

    // ✅ Helper method to build full name manually (backup)
    private String buildFullName(UserEntity user) {
        StringBuilder fullName = new StringBuilder();

        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
            fullName.append(user.getLastName().trim());
        }

        if (user.getMiddleName() != null && !user.getMiddleName().trim().isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(user.getMiddleName().trim());
        }

        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(user.getFirstName().trim());
        }

        return fullName.toString().trim();
    }

    // ✅ Safe string contains check
    private boolean containsIgnoreCase(String text, String keyword) {
        if (text == null || keyword == null) {
            return false;
        }
        return text.toLowerCase().contains(keyword);
    }


}
