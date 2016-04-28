FROM nullfox/nodejs-zmq

WORKDIR /root

# Capture the token and push into npmrc
ARG NPM_TOKEN
RUN echo $NPM_TOKEN > .npmrc

# Copy package and install
COPY package.json /root/package.json
RUN ["npm", "install"]

# Copy source nad compile
COPY src /root/src
RUN ["npm", "run", "build"]

# Clean up after ourselves (removes npm token)
RUN ["npm", "prune", "--production"]
RUN ["rm", "-f", ".npmrc"]

EXPOSE 8080

# Light it offfffff
CMD ["npm", "start"]