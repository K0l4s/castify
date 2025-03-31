package com.castify.backend.models.conversation;

import com.castify.backend.enums.MemberRole;
import com.castify.backend.models.user.ShortUser;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FullMemberInfor {
    private ShortUser members;
    private MemberRole role = MemberRole.MEMBER;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime joinTime = LocalDateTime.now();
    private LastReadMessage lastReadMessage;
}
