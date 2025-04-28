# Sử dụng Eclipse Temurin 21 JDK trên Alpine
FROM eclipse-temurin:21-jdk-alpine

# Tạo thư mục /app và set làm thư mục làm việc
WORKDIR /app

# Copy toàn bộ source code vào container
COPY . .

# Cấp quyền thực thi cho file mvnw
RUN chmod +x mvnw

# Build ứng dụng (skip test để nhanh hơn)
RUN ./mvnw -B -DskipTests clean install

# Chạy ứng dụng bằng file JAR vừa build
CMD ["sh", "-c", "java -jar target/*.jar"]
