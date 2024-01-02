# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.16.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production


WORKDIR /app
# Copy the current directory contents into the container at /app
COPY ./apps/full-circle-chatbot/ /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN npm install

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD ["node", "./main.js"]
