package com.castify.backend.service.frame;

import com.castify.backend.entity.FrameEntity;
import com.castify.backend.entity.UserFrameEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.VoucherEntity;
import com.castify.backend.enums.FrameStatus;
import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.models.frame.VoucherModelRequest;
import com.castify.backend.repository.FrameRepository;
import com.castify.backend.repository.UserFrameRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.VoucherRepository;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.user.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
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

    @Autowired
    private VoucherRepository voucherRepository;
    private static final Logger logger = Logger.getLogger(FrameServiceImpl.class.getName());

    @Override
    public FrameModel uploadFrame(UploadFrameRequest uploadFrameRequest) throws Exception {
        if (uploadFrameRequest.getImageFile() == null || uploadFrameRequest.getImageFile().isEmpty()) {
            throw new Exception("Image file is empty");
        }

        FrameEntity frameEntity = new FrameEntity();

        String imageURL = uploadFileService.uploadImage(uploadFrameRequest.getImageFile());
        frameEntity.setImageURL(imageURL);
        frameEntity.setPrice(uploadFrameRequest.getPrice());
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
        UserEntity currentUser = userService.getUserByAuthentication();

        // Nếu repo trả về List<UserFrameEntity>
        List<UserFrameEntity> usedFramesList = userFrameRepository.findByUserId(currentUser.getId());
        UserFrameEntity usedFrames = usedFramesList.isEmpty() ? null : usedFramesList.get(0);

        Set<String> boughtFrameIds = new HashSet<>();
        if (usedFrames != null && usedFrames.getFrames() != null) {
            boughtFrameIds.addAll(usedFrames.getFrames());
        }

        return frames.stream().map(frameEntity -> {
            FrameModel model = modelMapper.map(frameEntity, FrameModel.class);
            model.setBuy(boughtFrameIds.contains(frameEntity.getId()));
            return model;
        }).collect(Collectors.toList());
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
        UserEntity currentUser = userService.getUserByAuthentication();

        return frames.stream().map(frameEntity -> modelMapper.map(frameEntity, FrameModel.class)).collect(Collectors.toList());
    }

    @Override
    public FrameModel purchaseFrame(String frameId,String voucherCode) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        if (frame.getStatus() != FrameStatus.ACCEPTED) {
            throw new Exception("Frame is not available for purchase");
        }

        if (currentUser.getCoin() < frame.getPrice()) {
            throw new Exception("Insufficient coins. You need " + frame.getPrice() + " coins to purchase this frame.");
        }

        boolean alreadyOwned = userFrameRepository.existsByUserIdAndFramesContains(currentUser.getId(), frameId);
        if (alreadyOwned) {
            throw new Exception("You already own this frame");
        }

        try {
//            long price = frame.getPrice();
            // Deduct coins from buyer


            long price = calculateDiscountedPrice(frame, voucherCode);
            logger.info(" "+price);

            currentUser.setCoin(currentUser.getCoin() - price);
            userRepository.save(currentUser);

            // Add coins to seller
            UserEntity seller = frame.getUser();
            seller.setCoin(seller.getCoin() + price);
            userRepository.save(seller);

            UserFrameEntity userFrame = new UserFrameEntity();
            userFrame.setUser(currentUser);
            userFrame.addFrame(frame);
            userFrame.setPurchasedAt(LocalDateTime.now());
            userFrameRepository.save(userFrame);

            return modelMapper.map(frame, FrameModel.class);
        } catch (Exception e) {
            throw new Exception("Failed to process purchase: " + e.getMessage());
        }
    }
    private long calculateDiscountedPrice(FrameEntity frame, String code) {
        long price = frame.getPrice();
        if (code != null) {
            VoucherEntity voucher = voucherRepository.findByVoucherCode(code);
            if (voucher!=null && voucher.checkValidAmount() && voucher.checkValidDate()
                    && voucher.checkValidFrameIds(frame.getId())) {
                price -= Math.round(price * voucher.getPercent());
            }
        }
        return price;
    }

    @Override
    public List<FrameModel> getPurchasedFrames() throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();
        
        // Get all user frames for current user
        List<UserFrameEntity> userFrames = userFrameRepository.findByUserId(currentUser.getId());
        
        // Extract frame IDs from user frames
        List<String> frameIds = userFrames.stream()
                .flatMap(userFrame -> userFrame.getFrames().stream())
                .collect(Collectors.toList());
        
        // Get all frames by IDs
        List<FrameEntity> frames = frameRepository.findAllById(frameIds);
        
        // Map to FrameModel and return
        return frames.stream()
                .map(frame -> modelMapper.map(frame, FrameModel.class))
                .collect(Collectors.toList());
    }

    @Override
    public FrameModel updateFrameByUser(String frameId, String name, Integer price) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();
        
        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        // Check if the current user owns this frame
        if (!frame.getUser().getId().equals(currentUser.getId())) {
            throw new Exception("You don't have permission to update this frame");
        }

        // Update frame details
        frame.setName(name);
        frame.setPrice(price);
        // Set status back to PROCESSING for admin review
        frame.setStatus(FrameStatus.PROCESSING);
        frame.setLastEditedAt(LocalDateTime.now());

        frame = frameRepository.save(frame);
        return modelMapper.map(frame, FrameModel.class);
    }

    @Override
    public FrameModel updateFrameStatus(String frameId, FrameStatus status) throws Exception {
        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        // Only allow updating from PROCESSING to ACCEPTED or REJECTED
        if (frame.getStatus() != FrameStatus.PROCESSING) {
            throw new Exception("Can only update status for frames in PROCESSING state");
        }

        if (status != FrameStatus.ACCEPTED && status != FrameStatus.REJECTED) {
            throw new Exception("Invalid status update. Can only update to ACCEPTED or REJECTED");
        }

        frame.setStatus(status);
        frame.setLastEditedAt(LocalDateTime.now());

        frame = frameRepository.save(frame);
        return modelMapper.map(frame, FrameModel.class);
    }

    @Override
    public void deleteFrame(String frameId) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();
        
        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        // Check if the current user owns this frame
        if (!frame.getUser().getId().equals(currentUser.getId())) {
            throw new Exception("You don't have permission to delete this frame");
        }

        // Check if the frame has been purchased by anyone
        List<UserFrameEntity> purchasedFrames = userFrameRepository.findByFrameId(frameId);
        if (purchasedFrames.size() > 1 || (purchasedFrames.size() == 1 && !purchasedFrames.get(0).getUser().getId().equals(currentUser.getId()))) {
            throw new Exception("Cannot delete frame that has been purchased by other users");
        }

        // Delete the user-frame relationship first
        userFrameRepository.deleteByUserIdAndFrameId(currentUser.getId(), frameId);

        //Delete the usedFrame relation first
        List<UserEntity> usersUsingFrame = userRepository.findByUsedFrameId(frameId);
        if (!usersUsingFrame.isEmpty()) {
            for (UserEntity user : usersUsingFrame) {
                user.setUsedFrame(null);
            }
            userRepository.saveAll(usersUsingFrame);
        }

        // Then delete the frame
        frameRepository.delete(frame);
    }

    @Override
    public void applyFrame(String frameId) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        FrameEntity usedFrame = currentUser.getUsedFrame();
        if (usedFrame != null && usedFrame.getId().equals(frameId)) {
            throw new Exception("You already apply this frame!");
        }

        currentUser.setUsedFrame(frame);
        userRepository.save(currentUser);
    }
    @Override
    public void cancelCurrentFrame() throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();
        currentUser.setUsedFrame(null);
        userRepository.save(currentUser);
    }
    @Override
    public VoucherModelRequest createVoucher(VoucherModelRequest voucher){
        VoucherEntity newVou = modelMapper.map(voucher, VoucherEntity.class);
        VoucherEntity savedVou = voucherRepository.save(newVou);
        return modelMapper.map(savedVou,VoucherModelRequest.class);
    }
    @Override
    public FrameModel giftFrame(String awardeeId, String frameId, String voucherCode) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        FrameEntity frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new Exception("Frame not found"));

        if (frame.getStatus() != FrameStatus.ACCEPTED) {
            throw new Exception("Frame is not available for purchase");
        }

        if (currentUser.getCoin() < frame.getPrice()) {
            throw new Exception("Insufficient coins. You need " + frame.getPrice() + " coins to gift this frame.");
        }

        boolean alreadyOwned = userFrameRepository.existsByUserIdAndFramesContains(awardeeId, frameId);
        if (alreadyOwned) {
            throw new Exception("This user already own this frame");
        }

        try {
//            long price = frame.getPrice();
            // Deduct coins from buyer


            long price = calculateDiscountedPrice(frame, voucherCode);
            logger.info(" "+price);

            currentUser.setCoin(currentUser.getCoin() - price);
            userRepository.save(currentUser);

            // Add coins to seller
            UserEntity seller = frame.getUser();
            seller.setCoin(seller.getCoin() + price);
            userRepository.save(seller);

            UserFrameEntity userFrame = new UserFrameEntity();
            UserEntity awardee = userRepository.findUserEntityById(awardeeId);
            userFrame.setUser(awardee);
            userFrame.addFrame(frame);
            userFrame.setPurchasedAt(LocalDateTime.now());
            userFrameRepository.save(userFrame);

            return modelMapper.map(frame, FrameModel.class);
        } catch (Exception e) {
            throw new Exception("Failed to process gift: " + e.getMessage());
        }
    }
}
