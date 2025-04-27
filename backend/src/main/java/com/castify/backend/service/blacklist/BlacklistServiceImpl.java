package com.castify.backend.service.blacklist;

import com.castify.backend.entity.BlacklistEntity;
import com.castify.backend.models.blacklist.PosModel;
import com.castify.backend.repository.BlacklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlacklistServiceImpl implements IBlacklistService{
    @Autowired
    private BlacklistRepository blacklistRepository;

    @Override
    public int calculateViolationScore(String text) {
        int totalScore = 0;
        String lowerText = text.toLowerCase(); // để so sánh không phân biệt hoa thường
        List<BlacklistEntity> blacklist = blacklistRepository.findAll();
        for (BlacklistEntity entity : blacklist) {
            String value = entity.getValue();
            if (value != null && !value.isEmpty()) {
                boolean containsValue = lowerText.contains(value.toLowerCase());

                if (containsValue) {
                    int label = entity.getLabel();

                    // Xử lý ngoại lệ nếu có
                    if (entity.getPos() != null && !entity.getPos().isEmpty()) {
                        for (PosModel exception : entity.getPos()) {
                            if (exception.getPos() != null && !exception.getPos().isEmpty()) {
                                if (lowerText.contains(exception.getPos().toLowerCase())) {
                                    // Nếu văn bản chứa ngoại lệ thì cộng label của ngoại lệ
                                    label = exception.getLabel();
                                    break; // Ưu tiên lấy ngoại lệ đầu tiên tìm được
                                }
                            }
                        }
                    }

                    totalScore += label;
                }
            }
        }

        return totalScore;
    }

}
