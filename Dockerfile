FROM alpine:3.9

EXPOSE 3000

RUN apk add --no-cache \
      python \
      build-base \
      nodejs \
      nodejs-npm

COPY ["package.json", "/"]

RUN ["npm", "i"]
RUN ["npx", "webpack", "build"]

COPY ["src/server", "loadme"]
COPY ["public", "public"]

ENTRYPOINT ["node", "loadme/server.js"]
