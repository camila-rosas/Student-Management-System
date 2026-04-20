FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y gradle

RUN gradle build -x test

CMD ["sh", "-c", "java -jar $(ls build/libs/*.jar)"]
