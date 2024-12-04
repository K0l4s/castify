package com.castify.backend.models.userActivity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityGroupedByDate {
    private String date;
    private List<UserActivityModel> activities;
}
