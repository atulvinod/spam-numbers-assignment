FROM node:21-alpine3.18
RUN apk update
RUN apk add --no-cache bash
SHELL [ "/bin/bash","-c" ]

ARG cookieDomain=localhost
ARG cookiePath=/
ARG secureCookie=false
ARG cookieSecret=xxxxxxxxxxxxxx
ARG cookieExp=259200000
ARG jwtSecret=xxxxxxxxxxxxxx
ARG jwtAud=localhost
ARG jwtIssuer=localhost
ARG jwtExp=1y
ARG dbUrl=postgres://postgres:mypassword@test-db/postgres


ENV COOKIE_DOMAIN=${cookieDomain}
ENV COOKIE_PATH=${cookiePath}
ENV COOKIE_SECRET=${cookieSecret}
ENV JWT_SECRET=${jwtSecret}
ENV COOKIE_EXP=${cookieExp}
ENV JWT_AUDIENCE=${jwtAud}
ENV JWT_ISSUER=${jwtIssuer}
ENV JWT_EXP=${jwtExp}
ENV DB_URL=${dbUrl}

ENV JET_LOGGER_MODE=CONSOLE
ENV JET_LOGGER_FILEPATH=jet-logger.log
ENV JET_LOGGER_TIMESTAMP=TRUE
ENV JET_LOGGER_FORMAT=LINE

WORKDIR /app
COPY . .
RUN mkdir env
RUN touch ./env/production.env
RUN npm install
ENV NODE_ENV=production
RUN npm run build
CMD [ "npm","run","start" ]