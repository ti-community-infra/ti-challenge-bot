FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/

RUN npm install

COPY . /usr/src/app

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
