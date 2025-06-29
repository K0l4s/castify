package com.castify.backend.service.blacklist;

import com.castify.backend.entity.BlacklistEntity;
import com.castify.backend.models.blacklist.PosModel;
import com.castify.backend.repository.BlacklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

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
    @Override
    public String censorViolationWords(String text) {
        String lowerText = text.toLowerCase();
        String censoredText = text; // giữ nguyên chữ gốc để thay thế

        List<BlacklistEntity> blacklist = blacklistRepository.findAll();
        for (BlacklistEntity entity : blacklist) {
            String value = entity.getValue();
            if (value != null && !value.isEmpty()) {
                String valueLower = value.toLowerCase();

                if (lowerText.contains(valueLower)) {
                    boolean isException = false;

                    if (entity.getPos() != null && !entity.getPos().isEmpty()) {
                        for (PosModel exception : entity.getPos()) {
                            if (exception.getPos() != null && !exception.getPos().isEmpty()) {
                                if (lowerText.contains(exception.getPos().toLowerCase())) {
                                    isException = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!isException) {
                        // Tạo bản che: ví dụ "tuấn" -> "t***"
                        String censoredWord = value.charAt(0) + "*".repeat(value.length() - 1);

                        // Regex thay thế không phân biệt hoa thường
                        censoredText = censoredText.replaceAll("(?i)" + Pattern.quote(value), censoredWord);
                    }
                }
            }
        }

        return censoredText;
    }


}
