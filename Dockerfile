FROM node

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

EXPOSE 5000

CMD [ "yarn", "run", "start:prod" ]
