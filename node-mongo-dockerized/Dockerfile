FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server ./server

EXPOSE 3030
CMD ["npm", "start"]
