FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g nodemon
RUN npm i

COPY . .
COPY .env.docker .env

EXPOSE 8080

CMD ["npm", "run", "prod"]