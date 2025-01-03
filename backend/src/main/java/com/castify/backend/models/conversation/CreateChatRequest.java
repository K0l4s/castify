package com.castify.backend.models.conversation;

import com.castify.backend.models.user.ShortUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRequest {
    private String id;
    private String title;
    private String imageUrl;
    private List<MemberInfor> memberList = new ArrayList<>();
}
