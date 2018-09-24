FROM ubuntu:18.04

# Install useful tools
RUN apt-get update && apt-get install -y \
    curl vim sudo gnupg gnupg2 gnupg1 git make g++

# Install kerberos
RUN apt-get update && apt-get install -y libkrb5-dev

# Install Node10 and npm
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
RUN apt-get update && apt-get install -y nodejs

RUN npm install -g npm@6.4.0

# Copy source files over
RUN mkdir /portal
COPY ./src /portal/src
COPY ./package.json /portal/package.json
COPY ./app.js /portal/app.js
COPY ./auth /portal/auth
COPY ./static /portal/static
COPY ./views /portal/views

# Set VM working directory
WORKDIR /portal

# Install dependencies
RUN npm install

# Start Service
CMD ["npm", "start"]
