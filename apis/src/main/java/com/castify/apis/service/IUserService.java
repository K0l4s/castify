package com.castify.apis.service;

import com.castify.apis.models.user.UserModel;

public interface IUserService {
    UserModel getUserByUsername(String username) throws Exception;
}
