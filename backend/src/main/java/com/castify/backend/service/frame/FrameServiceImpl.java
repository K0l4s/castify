package com.castify.backend.service.frame;

import com.castify.backend.entity.FrameEntity;
import com.castify.backend.entity.UserFrameEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.FrameStatus;
import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.repository.FrameRepository;
import com.castify.backend.repository.UserFrameRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.user.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FrameServiceImpl implements IFrameService{

    @Autowired
    private IUserService userService;

    @Autowired
    private IUploadFileService uploadFileService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private FrameRepository frameRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFrameRepository userFrameRepository;

    @Override
    public FrameModel uploadFrame(UploadFrameRequest uploadFrameRequest) throws Exception {
        if (uploadFrameRequest.getImageFile() == null || uploadFrameRequest.getImageFile().isEmpty()) {
            throw new Exception("Image file is empty");
        }

        FrameEntity frameEntity = new FrameEntity();

        String imageURL = uploadFileService.uploadImage(uploadFrameRequest.getImageFile());
        frameEntity.setImageURL(imageURL);
        frameEntity.setUser(userService.getUserByAuthentication());
        frameEntity.setName(uploadFrameRequest.getName());
        frameEntity.setStatus(FrameStatus.PROCESSING);
        frameEntity.setLastEditedAt(LocalDateTime.now());

        frameEntity = frameRepository.save(frameEntity);

        UserFrameEntity userFrameEntity = new UserFrameEntity();

        userFrameEntity.setUser(userService.getUserByAuthentication());
        userFrameEntity.addFrame(frameEntity);
        userFrameEntity.setPurchasedAt(LocalDateTime.now());

        userFrameRepository.save(userFrameEntity);

        return modelMapper.map(frameEntity, FrameModel.class);
    }

//  Get all accepted frame for shop public
    @Override
    public List<FrameModel> getAllAcceptedFrames() throws Exception {
        List<FrameEntity> frames = frameRepository.findAllByStatus(FrameStatus.ACCEPTED);
        return frames.stream().map(frameEntity -> modelMapper.map(frameEntity, FrameModel.class)).collect(Collectors.toList());
    }

//   Get all uploads by one user currently login (MyShop)
    @Override
    public List<FrameModel> getUserUploadedFrames() throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        List<FrameEntity> frames = frameRepository.findByUserId(currentUser.getId());

        return frames.stream()
                .map(frameEntity -> modelMapper.map(frameEntity, FrameModel.class))
                .collect(Collectors.toList());
    }

    //    Get all frame for admin
    @Override
    public List<FrameModel> getAllFrames() throws Exception {
        List<FrameEntity> frames = frameRepository.findAll();
        return frames.stream().map(frameEntity -> modelMapper.map(frameEntity, FrameModel.class)).collect(Collectors.toList());
    }




}
