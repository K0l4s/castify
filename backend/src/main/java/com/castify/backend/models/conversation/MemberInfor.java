package com.castify.backend.models.conversation;

import com.castify.backend.enums.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberInfor {
    private String memberId;
    private MemberRole role = MemberRole.MEMBER;
    private LocalDateTime joinTime = LocalDateTime.now();
}
