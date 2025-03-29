package com.castify.backend.entity;

import com.castify.backend.models.conversation.MemberInfor;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Document(collection = "chat")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChatEntity {
    @Id
    private String id;
    private String title;
    private String imageUrl;
    private List<MemberInfor> memberList = new ArrayList<>();
    private boolean isActive = true;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt = LocalDateTime.now();

    public int getMemberSize() {
        return memberList.size();
    }
}