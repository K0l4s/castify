package com.castify.backend.models.conversation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShortConversationModel {
    private String id;
    private String title;
    private String imageUrl;
    private int memberSize;
}
