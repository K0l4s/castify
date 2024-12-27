package com.castify.backend.models.conversation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRequest {
    private String title;
    private String name;
    private List<MemberInfor> memberList = new ArrayList<>();
}
