# Dùng OpenJDK image làm base
FROM openjdk:17-jdk-slim

# Copy file JAR vào container
COPY target/backend-0.0.1-SNAPSHOT.jar /app/myapp.jar
COPY .env /app/.env
WORKDIR /app
# Expose cổng 8080 (hoặc cổng ứng dụng của mày)
EXPOSE 9090

# Lệnh để chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "/app/myapp.jar"]
