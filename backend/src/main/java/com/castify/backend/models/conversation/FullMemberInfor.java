package com.castify.backend.models.conversation;

import com.castify.backend.enums.MemberRole;

import java.time.LocalDateTime;

public class FullMemberInfor {
    private String memberId;
    private MemberRole role = MemberRole.MEMBER;
    private boolean isAccepted;
    private boolean isHide; //Ẩn nhóm hay không
    private LocalDateTime joinTime = LocalDateTime.now();
    private LastReadMessage lastReadMessage;
    public void setIsAccepted(boolean isAccepted){
        this.isAccepted = isAccepted;
    }
}
