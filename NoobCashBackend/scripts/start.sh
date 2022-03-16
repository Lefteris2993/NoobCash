#!/bin/bash

source config

# use ssh user@location before command to run if server is in a remote location.

cd $_APP_LOCATION

# Compile
npx tsc

# Generate random password
SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13 ; echo '')

# starting Bootstrap node
IS_BOOTSTRAP=true \
DIFFICULTY=$_DIFFICULTY \
TOTAL_NODES=$_TOTAL_NODES \
PORT=3001 \
BOOTSTRAP_NODE_URL=$_BOOTSTRAP_NODE_URL \
NODE_URL=$_BOOTSTRAP_NODE_URL \
BLOCK_CAPACITY=$_BLOCK_CAPACITY \
NODE_SECRET=$SECRET \
PRODUCTION=$_PRODUCTION \
node ./dist/src/app.js > .log1 & 

for (( i=2; i<=$_TOTAL_NODES; i++ ))
do  
    npx tsc
    SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13 ; echo '')

    IS_BOOTSTRAP=false \
    DIFFICULTY=$_DIFFICULTY \
    TOTAL_NODES=$_TOTAL_NODES \
    PORT=${_PORT}${i} \
    BOOTSTRAP_NODE_URL=$_BOOTSTRAP_NODE_URL \
    NODE_URL=http://${_NODE_ADDRESS}${i}:${_PORT}${i} \
    BLOCK_CAPACITY=$_BLOCK_CAPACITY \
    NODE_SECRET=$SECRET \
    PRODUCTION=$_PRODUCTION \
    node ./dist/src/app.js > .log${i} &
done
