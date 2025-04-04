package com.castify.backend.service.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;

import java.util.List;

public interface IFrameService {
    FrameModel uploadFrame(UploadFrameRequest uploadFrameRequest) throws Exception;
    List<FrameModel> getAllFrames() throws Exception;
    List<FrameModel> getAllAcceptedFrames() throws Exception;
    List<FrameModel> getUserUploadedFrames() throws Exception;
    FrameModel purchaseFrame(String frameId) throws Exception;
}
