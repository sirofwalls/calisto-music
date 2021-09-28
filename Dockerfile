FROM node:16.1.0-stretch

WORKDIR /usr/nodeapp

# install python (needed for some of the libraries) and make
RUN apt-get update && \
	apt-get install -y python3 build-essential && \
	apt-get purge -y --auto-remove

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
