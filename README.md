# Reddit Search Clone

## Description

This project is reddit search clone implemented with NestJS and Elasticsearch to deliver a high-performance, full-text search engine. The SearchService implements advanced query strategies, including n-gram matching, fuzzy search, and phrase prefixing, to provide relevant results across post titles and content. It features a robust pagination system with dynamic filtering by subreddit, result highlighting for frontend display, and an auto-suggestion mechanism to enhance user discovery.

## Getting Started

```bash
# Copy .env.example
cp .env.example .env

# Run Docker for services
docker compose up --build

# Run migration
npm run migration:generate
npm run migration:create

# Run seeding
npm run seed

# Install dependencies
npm install

# Run development server
npm run start:dev
```
