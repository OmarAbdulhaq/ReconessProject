FROM node:20.10.0 as build-stage
WORKDIR /react-docker-example/
COPY package*.json ./
RUN npm install

COPY src ./
COPY public ./

CMD ["npm", "start"]