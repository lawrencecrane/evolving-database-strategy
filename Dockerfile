FROM node:lts-alpine

WORKDIR /home/node/packages

COPY packages/ts-nature ./ts-nature/

WORKDIR /home/node/template/nature

COPY template/nature/package*.json ./

RUN npm install

COPY template/nature/tsconfig.json .
COPY template/nature/src ./src/

RUN npm run build

WORKDIR /home/node/template

COPY template/schema ./schema/
COPY template/evolutions ./evolutions/
COPY template/devolutions ./devolutions/

WORKDIR /home/node/template/nature

ENV SCHEMA_DIR /home/node/template/schema
ENV EVOLUTION_DIR /home/node/template/evolutions
ENV DEVOLUTION_DIR /home/node/template/devolutions

CMD ["npm", "start"]