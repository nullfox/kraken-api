FROM nullfox/nodejs-zmq

WORKDIR /root

# Copy package and install
COPY node_modules /root/node_modules
COPY package.json /root/package.json
RUN ["npm", "install", "zeromq", "msgpack"]

# Copy source nad compile
COPY lib /root/lib

# Clean up after ourselves (removes npm token)
RUN ["npm", "prune", "--production"]

EXPOSE 8080

# Light it offfffff
CMD ["npm", "start"]