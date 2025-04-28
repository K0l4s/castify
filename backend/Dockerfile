# Use the Eclipse Temurin 21 JDK with Alpine
FROM eclipse-temurin:21-jdk-alpine

# Create and set the app directory
WORKDIR /app

# Copy all files into container
COPY . .

# Add permission to execute mvnw
RUN chmod +x mvnw

# Build the app
RUN ./mvnw -B -DskipTests clean install

# Run the app
CMD ["sh", "-c", "java -jar target/*.jar"]
