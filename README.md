# SafeFlight Project

SafeFlight is a Spring Boot + React flight booking application with PostgreSQL.

## Prerequisites

- Java 24
- Docker (for PostgreSQL)
- Node.js 24.x and npm 11.x (for frontend dev and E2E)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harrishdhaithya/group4-safeflight-project.git
cd group4-safeflight-project
```

### 2. Start PostgreSQL

```bash
docker compose up -d db
```

---

## Project Structure

<img src="images/filestruct.png"/>

---

## Important Files and Folders

* **`src/main/java`**
  Contains all backend Java source files.

* **`src/main/webapp`**
  Contains all frontend (React) code.

* **`src/main/resources/application.properties`**
  Contains logging and application configuration.

* **`build/generated/frontend-static`**
  Generated frontend static assets used during packaging/runtime.

* **`build.gradle`**
  Contains all Gradle build configurations.

* **`.gitignore`**
  Lists files and folders that should not be tracked by Git.

---

## Run the Application (Local)

From project root:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/safeflight \
SPRING_DATASOURCE_USERNAME=safeflight \
SPRING_DATASOURCE_PASSWORD=safeflight \
./gradlew bootRun
```

App URL: `http://localhost:8080`

---

## Build Commands

### Incremental build

```bash
./gradlew build
```

### Clean

```bash
./gradlew clean
```

### Full build

```bash
./gradlew clean build
```

### Build runnable JAR

```bash
./gradlew clean bootJar
```

---

## Frontend Development (React)

From `src/main/webapp`:

```bash
npm ci
npm start
```

Dev server URL: `http://localhost:3000`

---

## Testing Commands

### Backend

```bash
./gradlew unitTest
./gradlew integrationTest
./gradlew coverage
```

### Frontend

From `src/main/webapp`:

```bash
npm ci
npm run coverage:check
```

### E2E (Playwright)

From `src/main/webapp`:

```bash
# first-time browser install
npx playwright install chromium

# local headed mode
npm run e2e

# CI/headless mode
npm run e2e:ci
```
---

## Stop Local Services

```bash
docker compose down
```

