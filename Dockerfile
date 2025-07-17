# Step 1: Build the backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy package.json and yarn.lock
COPY backend/package.json backend/yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY backend/ .

# Build TypeScript code
RUN yarn build

# Step 2: Run the backend
FROM node:18-alpine

WORKDIR /app

# Copy the built files from the previous step
COPY --from=backend /app .

# Expose the port your backend will run on
EXPOSE 4000

# Run the backend
CMD ["yarn", "start"]
