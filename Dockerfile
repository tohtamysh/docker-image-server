FROM alpine:latest as builder

ARG tag=v3.3.1

RUN apk --update --no-cache add \
    build-base \
    autoconf \
    automake \
    libtool \
    pkgconf \
    nasm \
    tar \
    cargo \
    git

WORKDIR /src/mozjpeg
ADD https://github.com/mozilla/mozjpeg/archive/$tag.tar.gz ./

RUN tar -xzf $tag.tar.gz
RUN rm $tag.tar.gz

RUN SRC_DIR=$(ls -t1 -d mozjpeg-* | head -n1) && \
    cd $SRC_DIR && \
    autoreconf -fiv && \
    cd .. && \
    sh $SRC_DIR/configure && \
    make install \
         prefix=/usr/local \
         libdir=/usr/local/lib64

ARG oxi_tag=v2.3.0
WORKDIR /src/oxipng
ADD https://github.com/shssoichiro/oxipng/archive/$oxi_tag.tar.gz ./

RUN tar -xzf $oxi_tag.tar.gz
RUN rm $oxi_tag.tar.gz

RUN SRC_DIR=$(ls -t1 -d oxipng-* | head -n1) && \
    cd $SRC_DIR && \
    cargo build --release && \
    cp target/release/oxipng /usr/local/bin

FROM node:lts-alpine

COPY --from=builder /usr/local /usr/local

COPY ./package.json /app/package.json

COPY ./server.js /app/server.js

WORKDIR /app

RUN npm install

EXPOSE 8000

ENTRYPOINT ["node", "server.js"]
