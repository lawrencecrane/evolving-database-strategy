FROM node:lts-alpine

WORKDIR /home/node/nature

COPY nature/package*.json ./

RUN npm install

COPY nature/tsconfig.json .

COPY nature/src ./src/

RUN npm run build

WORKDIR /home/node

COPY schema ./schema/

COPY evolutions ./evolutions/

COPY devolutions ./devolutions/

WORKDIR /home/node/nature

ENV SCHEMA_DIR /home/node/schema
ENV EVOLUTION_DIR /home/evolutions
ENV DEVOLUTION_DIR /home/node/devolutions

CMD ["npm", "start"]