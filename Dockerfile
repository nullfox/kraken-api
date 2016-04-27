FROM nullfox/nodejs-zmq

WORKDIR /root

COPY package.json /root/package.json
RUN ["npm", "install"]

COPY index.js /root/index.js
COPY src /root/src
RUN ["npm", "run", "build"]

EXPOSE 8080

CMD ["node", "index.js"]