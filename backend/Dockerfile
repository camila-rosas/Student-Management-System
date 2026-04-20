FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x gradlew

RUN ./gradlew build -x test

# Find jar dynamically instead of hardcoding name
CMD ["sh", "-c", "java -jar $(ls build/libs/*.jar)"]
