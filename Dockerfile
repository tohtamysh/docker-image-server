FROM tohtamysh/optimize-image

COPY ./package.json /app/package.json

COPY ./server.js /app/server.js

WORKDIR /app

RUN npm install

EXPOSE 8000

ENTRYPOINT ["node", "server.js"]