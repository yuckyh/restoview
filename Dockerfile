FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g nodemon
RUN npm i

COPY . .
COPY .env.prod .env

EXPOSE 80

COPY wait-for-it.sh wait-for-it.sh
RUN chmod +x wait-for-it.sh

ENTRYPOINT [ "/bin/bash", "-c" ]

CMD ["npm run prod"]