package com.castify.backend.service.report;

import com.castify.backend.entity.ReportEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.ReportProgressType;
import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.report.ProgressReport;
import com.castify.backend.models.report.ReportProgress;
import com.castify.backend.models.report.ReportRequest;
import com.castify.backend.models.report.ReportResponse;
import com.castify.backend.repository.ReportRepository;
import com.castify.backend.service.comment.CommentServiceImpl;
import com.castify.backend.service.comment.ICommentService;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportServiceImpl implements IReportService {
    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Autowired
    private IPodcastService podcastService = new PodcastServiceImpl();
    @Autowired
    private ICommentService commentService = new CommentServiceImpl();

    @Override
    public String sendReport(ReportRequest request) throws Exception {
        ReportEntity reportEntity = new ReportEntity();
        reportEntity = modelMapper.map(request, ReportEntity.class);
        UserEntity requestUser = userService.getUserByAuthentication();
        reportEntity.setUserRequest(requestUser);
        reportRepository.save(reportEntity);
        return "Send Report Successfully";
    }

    @Override
    public String progressReport(String reportId, ProgressReport reportProgress) throws Exception {
        ReportEntity report = reportRepository.findById(reportId).orElseThrow(
                () -> new Exception("Not found report")
        );
        if (report.getUserResponse() != null) {
            throw new IllegalStateException("This report has already been processed by another Admin.");
        }
        report.setStatus(reportProgress.getStatus());
        if (report.getHandleMethod() == null) {
            report.setHandleMethod(new ArrayList<>()); // Initialize the list if it's null
        }
        if (report.getStatus() == ReportStatus.ACCEPTED)
            for (ReportProgress rep : reportProgress.getProgressList()) {
                if (rep.getType() == ReportProgressType.BAN_USER) {
                    userService.banAccount(rep.getTargetId());
                    report.getHandleMethod().add("Ban user " + rep.getTargetId());
                } else if (rep.getType() == ReportProgressType.DEL_PODCAST) {
                    List<String> ids = new ArrayList<>();
                    ids.add(rep.getTargetId());
                    podcastService.deletePodcastsByIds(ids,true);
                    report.getHandleMethod().add("Delete Podcast " + rep.getTargetId());
                }
//                else if (rep.getType() == ReportProgressType.DEL_COMMENT){
//                    List<String> ids = new ArrayList<>();
//                    ids.add(rep.getTargetId());
//                    commentService.(ids,true);
//                }
            }
        report.setUserResponse(userService.getUserByAuthentication());
        reportRepository.save(report);
        return "Successfully";
    }

    @Override
    public PaginatedResponse<ReportResponse> getAllReport(Integer pageNumber, Integer pageSize, ReportStatus status, ReportType type, String keyword) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<ReportEntity> reportEntityPage;

        // Trường hợp có 'status' và 'type', không có 'keyword'
        if (status != null && type != null && (keyword == null || keyword.isEmpty())) {
            reportEntityPage = reportRepository.findByStatusAndType(status, type, pageable);
        }
        // Trường hợp có 'status' và 'type' và có 'keyword'
        else if (status != null && type != null && keyword != null && !keyword.isEmpty()) {
            reportEntityPage = reportRepository.findByStatusAndTypeAndTitleAndDetail(status, type, keyword, keyword, pageable);
        }
        // Trường hợp có 'status' và 'keyword', không có 'type'
        else if (status != null && (keyword != null && !keyword.isEmpty()) && type == null) {
            reportEntityPage = reportRepository.findByStatusAnKeyword(status, keyword, keyword, pageable);
        }
        // Trường hợp có 'type' và 'keyword', không có 'status'
        else if (type != null && (keyword != null && !keyword.isEmpty()) && status == null) {
            reportEntityPage = reportRepository.findByTypeAndKeyword(type, keyword, keyword, pageable);
        }
        // Trường hợp có 'keyword' nhưng không có 'status' và 'type'
        else if (keyword != null && !keyword.isEmpty() && status == null && type == null) {
            reportEntityPage = reportRepository.findByKeyword(keyword, keyword, pageable);
        }
        // Trường hợp có 'status' nhưng không có 'type' và 'keyword'
        else if (status != null && type == null && (keyword == null || keyword.isEmpty())) {
            reportEntityPage = reportRepository.findByStatus(status, pageable);
        }
        // Trường hợp có 'type' nhưng không có 'status' và 'keyword'
        else if (type != null && status == null && (keyword == null || keyword.isEmpty())) {
            reportEntityPage = reportRepository.findByType(type, pageable);
        }
        // Trường hợp không có bất kỳ bộ lọc nào, chỉ phân trang
        else {
            reportEntityPage = reportRepository.findAll(pageable);
        }

        int totalPages = reportEntityPage.getTotalPages();
        List<ReportResponse> responseReport = modelMapper
                .map(reportEntityPage.getContent(), new TypeToken<List<ReportResponse>>() {
                }.getType());

        return new PaginatedResponse<>(responseReport, totalPages);
    }


//    @Override
//    public PaginatedResponse<ReportResponse> getByStatus(Integer pageNumber, Integer pageSize,ReportStatus status){
//        Pageable pageable = PageRequest.of(pageNumber,pageSize);
//        Page<ReportEntity> reportEntityPage = reportRepository.findReportEntitiesByStatus(status,pageable);
//        int totalPages = reportEntityPage.getTotalPages();
//        List<ReportResponse> responseReport = modelMapper
//                .map(reportEntityPage.getContent(), new TypeToken<List<ReportResponse>>(){}.getType());
//        return new PaginatedResponse<>(responseReport,totalPages);
//    }
}
