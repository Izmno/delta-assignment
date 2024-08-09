# Delta Assigment - Asset Search Tracking Microservice

## Overview

This microservice is designed to track and return the most popular assets 
searched by users in the last 24 hours. The service also keeps track of the 
last 100 assets searched by a user in a FIFO manner. It is built using 
TypeScript, Node.js, Express, and MySQL, and is containerized with Docker 
for easy deployment.

> Note: The searches by the user are not really returned in a FIFO manner. I 
> decided that returning the most recent search first is more useful.

## Design considerations

Please read [rationale.md](./doc/rationale.md) where I try to explain the 
rationale behind the data modelling.

## Features

- **Track Searches:** Log each search made by users.
- **Trending Searches:** Retrieve the top 100 trending assets based on unique user searches within the last 24 hours.
- **Recent Searches:** Retrieve the last 100 assets searched by a specific user.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Clone the Repository

```bash
git clone git@github.com:izmno/delta-assignment.git
cd delta-assignment
```

### Environment Variables

The microservice relies on the following environment variables for 
configuration. You can set these in a `.env` file in the root of the project, 
or set them in the included `docker-compose.yaml` file when using Docker
Compose.


| Environment Variable | Description                             | Default Value   |
|----------------------|-----------------------------------------|-----------------|
| `DB_HOST`            | Hostname of the MySQL database          | `localhost`     |
| `DB_PORT`            | Port number for MySQL database          | `3306`          |
| `DB_USER`            | Username for MySQL database             | `root`          |
| `DB_PASSWORD`        | Password for MySQL database             | `password`      |
| `DB_NAME`            | Name of the MySQL database              | `search_db`     |
| `PORT`               | Port number for the microservice        | `3000`          |
| `REFRESH_INTERVAL`   | Interval in ms to refresh trends list   | `10000`         |

### Building and Running the Service

1. **(Optional) Build the Docker Image:**

   The Dockerfile is configured to build the TypeScript code and run the compiled JavaScript files.

   ```bash
   docker build -t asset-search-service .
   ```

2. **Start the Service with Docker Compose:**

   The `docker-compose.yml` file sets up the microservice along with an example MySQL database.
   Docker image for the main application is automatically built by Docker Compose. 

   ```bash
   docker-compose up
   ```

   This command will start both the microservice and a MySQL container with pre-loaded example data.

3. **Access the Service:**

   The microservice will be accessible at `http://localhost:3000`.

## API Endpoints

### Log a Search

**Endpoint:** `POST /search`

**Description:** Logs a search made by a user for a specific asset.

**Request Body:**

```json
{
  "user": 1,
  "asset": 101
}
```

**Response:**

- `200 OK`: Search logged successfully.
- `400 Bad Request`: Missing required fields.

### Get Trending Searches

**Endpoint:** `GET /trends`

**Description:** Retrieves the top 100 trending assets based on unique user searches within the last 24 hours.

**Response:**

```json
[101, 102, 103, ...]
```

**Response Codes:**

- `200 OK`: List of trending assets returned.

### Get Recent Searches by User

**Endpoint:** `GET /search?user=<userId>`

**Description:** Retrieves the last 100 assets searched by a specific user, returning the last searched asset first.

**Response:**

```json
[101, 105, 110, ...]
```

**Response Codes:**

- `200 OK`: List of recent searches returned.
- `400 Bad Request`: Missing or invalid `user`.

## Tests

A [k6](https://k6.io/) load test is included to test the performance of the 
microservice. Additionally, this test can be used to seed the example with 
random data.

```sh
docker run --rm \
    -v ./tests/k6:/scripts \
    --network delta-assignment_app-network \
    -w /scripts \
    grafana/k6 \
    run /scripts/load_test.js --vus 1000 --duration 30s \
    ;
```


## Conclusion

This microservice is designed to handle a large number of searches and provide real-time insights into trending assets. The architecture is built with scalability and performance in mind, using modern development practices and tools.

For any further questions or clarifications, feel free to reach out!

---

Thank you for considering this service for your engineering team at Delta!
