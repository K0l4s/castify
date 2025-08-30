# Dùng OpenJDK image làm base
FROM openjdk:17-jdk-slim

# Tạo thư mục app
WORKDIR /app

# Copy file JAR vào container
COPY target/backend-0.0.1-SNAPSHOT.jar /app/myapp.jar

# Expose cổng 9090
EXPOSE 9090

# Lệnh để chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "/app/myapp.jar"]