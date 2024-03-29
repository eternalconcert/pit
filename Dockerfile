FROM alpine:3.9

EXPOSE 3000

RUN apk add --no-cache \
      python \
      build-base \
      nodejs \
      nodejs-npm

COPY ["package.json", "/"]

RUN ["npm", "i"]

COPY ["src/server", "pit"]
COPY ["public", "public"]

ENTRYPOINT ["node", "pit/server.js"]
