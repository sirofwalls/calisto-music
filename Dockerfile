FROM node:16.1.0-stretch

#user name was made from gaming community
ENV USER=hemlock

# install python (needed for some of the libraries) and make
RUN apt-get update && \
	apt-get install -y python3 build-essential && \
	apt-get purge -y --auto-remove
	
# create user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/hemlock -r -g ${USER} ${USER}
	
# set up volume and user
USER ${USER}
WORKDIR /home/hemlock

COPY package*.json ./
RUN npm install
VOLUME [ "/home/hemlock" ]

COPY . .

ENTRYPOINT [ "node", "index.js" ]
