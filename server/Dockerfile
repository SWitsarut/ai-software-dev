FROM node:lts-alpine
WORKDIR /app

COPY package.json .

COPY tsconfig.json .

RUN npm install

EXPOSE 8080

CMD ["npm","run","dev"]