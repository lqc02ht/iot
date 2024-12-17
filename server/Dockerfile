FROM --platform=$BUILDPLATFORM node:18
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY mqtt mqtt
COPY index.js index.js

CMD ["node", "index.js"]