FROM nullfox/nodejs-zmq

WORKDIR /root

COPY package.json /root/package.json
RUN ["npm", "install"]

COPY src /root/src
RUN ["npm", "run", "build"]

COPY lib /root/lib
COPY index.js /root/index.js

EXPOSE 8080

CMD ["node", "index.js"]