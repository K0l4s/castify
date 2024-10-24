package com.castify.apis.collections;

import com.castify.apis.enums.ReportType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.catalina.User;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "report")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ReportCollection {
    @Id
    private String id;
    private String title;
    private String detail;
    private ReportType type;
    private String target;
    private LocalDateTime createdDay;

    @DBRef
    private User user;

}
