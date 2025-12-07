# Use Node.js LTS version
FROM node:22-alpine AS builder

# Install dependencies needed for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create data directory and set DATABASE_URL for build process
RUN mkdir -p /app/data
ENV DATABASE_URL=/app/data/monitoring.db

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy database migration files and config
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy database schema files (needed by drizzle.config.ts)
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db

# Create data directory for SQLite database with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=/app/data/monitoring.db

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Run database migrations and start the application
CMD ["sh", "-c", "npx drizzle-kit push --force && node build"]
