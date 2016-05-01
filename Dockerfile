FROM nullfox/nodejs-zmq

WORKDIR /root

# Capture the token and push into npmrc
ARG NPM_TOKEN
RUN echo $NPM_TOKEN > .npmrc

# Copy package and install
COPY node_modules /root/node_modules
COPY package.json /root/package.json
RUN ["npm", "install", "zmq", "msgpack"]

# Copy source nad compile
COPY lib /root/lib
COPY swagger.yaml /root/swagger.yaml

# Clean up after ourselves (removes npm token)
RUN ["npm", "prune", "--production"]
RUN ["rm", "-f", ".npmrc"]

EXPOSE 8080

# Light it offfffff
CMD ["npm", "start"]