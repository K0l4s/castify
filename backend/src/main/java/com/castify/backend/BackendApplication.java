package com.castify.backend;

import com.castify.backend.config.DotenvConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableMongoAuditing(auditorAwareRef = "applicationAuditAware")
//@EntityScan("com.castify.backend.entity")
public class BackendApplication {
	public static void main(String[] args) {
		DotenvConfig.loadEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

}
