FROM node:lts-alpine
# RUN npm install -g npm@latest
RUN npm install -g npm@7.19.1

# WORKDIR /app

# COPY package.json ./

COPY . .

# COPY client/package.json /client
RUN npm install --prefix client --omit=dev

# COPY server/package.json /server
RUN npm install --prefix server --omit=dev

# COPY client /client
RUN npm run build --prefix client

COPY server /server

USER node

CMD [ "npm", "start", "--prefix", "server" ]

EXPOSE 8000