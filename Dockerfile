FROM node:13-buster-slim AS base

RUN mkdir -p /app
WORKDIR /app

RUN apt-get update
RUN apt-get install -y git

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
ENV CONTAINERIZED true
ENTRYPOINT ["yarn"]
