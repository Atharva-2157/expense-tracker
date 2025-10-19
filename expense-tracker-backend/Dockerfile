FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy your built jar into container
COPY build/libs/*.jar app.jar

# Expose application port
EXPOSE 8080

# Run Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]