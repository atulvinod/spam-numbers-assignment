FROM node:21-alpine3.18
RUN apk update
RUN apk add --no-cache bash
SHELL [ "/bin/bash","-c" ]

WORKDIR /app
COPY . .
RUN chmod +x ./wait-for-it.sh
RUN chmod +x ./create-test-env.sh
RUN mkdir env
RUN touch ./env/test.env
RUN echo "NODE_ENV=test" >> ./env/test.env
RUN echo "COOKIE_DOMAIN=localhost" >> ./env/test.env
RUN echo "COOKIE_PATH=/" >> ./env/test.env
RUN echo "SECURE_COOKIE=false" >> ./env/test.env
RUN echo "COOKIE_SECRET=xxxxxxxxxxxxxx" >> ./env/test.env
RUN echo "JWT_SECRET=xxxxxxxxxxxxxx" >> ./env/test.env
RUN echo "COOKIE_EXP=259200000" >> ./env/test.env
RUN echo "JWT_AUDIENCE=localhost" >> ./env/test.env
RUN echo "JWT_ISSUER=localhost" >> ./env/test.env
RUN echo "JWT_EXP=1y" >> ./env/test.env
RUN echo "DB_URL=postgres://postgres:mypassword@test-db/postgres" >> ./env/test.env
RUN npm install
CMD [ "bash" ]