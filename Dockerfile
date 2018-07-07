FROM mhart/alpine-node

CMD mkdir /vpk
WORKDIR /vpk

COPY server.js .
COPY LICENSE .
COPY package.json .
COPY README.md .
COPY lib ./lib
COPY public ./public


RUN npm install

EXPOSE 4200

CMD ["node", "server.js"]
