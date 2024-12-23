# Sử dụng base image Java
FROM openjdk:17-jdk-slim

# Tạo thư mục ứng dụng trong container
WORKDIR /app

# Copy file WAR từ máy chủ vào container
COPY target/myapp.war /app/myapp.war

# Expose cổng ứng dụng
EXPOSE 8080

# Chạy ứng dụng Spring Boot với WAR
ENTRYPOINT ["java", "-jar", "/app/myapp.war"]
