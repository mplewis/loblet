FROM node:13-buster-slim AS base

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock .
RUN yarn install

COPY . .
ENV CONTAINERIZED true
ENTRYPOINT ["yarn"]
