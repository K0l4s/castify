package com.castify.backend.service;

import com.castify.backend.models.user.UserModel;

public interface IUserService {
    UserModel getUserByUsername(String username) throws Exception;

    UserModel getUserByToken() throws Exception;
}
