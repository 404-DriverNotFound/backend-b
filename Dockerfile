FROM node

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 5000

CMD [ "yarn", "run", "start" ]
