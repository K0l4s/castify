package com.castify.backend.service.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.enums.FrameStatus;
import com.castify.backend.models.frame.VoucherModelRequest;

import java.util.List;

public interface IFrameService {
    FrameModel uploadFrame(UploadFrameRequest uploadFrameRequest) throws Exception;
    List<FrameModel> getAllFrames() throws Exception;
    List<FrameModel> getAllAcceptedFrames() throws Exception;
    List<FrameModel> getUserUploadedFrames() throws Exception;
    FrameModel purchaseFrame(String frameId, String voucherId) throws Exception;
    List<FrameModel> getPurchasedFrames() throws Exception;
    FrameModel updateFrameByUser(String frameId, String name, Integer price) throws Exception;
    FrameModel updateFrameStatus(String frameId, FrameStatus status) throws Exception;
    void deleteFrame(String frameId) throws Exception;

    void applyFrame(String frameId) throws Exception;

    void cancelCurrentFrame() throws Exception;

    VoucherModelRequest createVoucher(VoucherModelRequest voucher);
}
