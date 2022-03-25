#!/bin/bash

source config

cd $_APP_LOCATION/scripts

_TOTAL_NODES=$1
_BLOCK_CAPACITY=$2
_DIFFICULTY=$3

$(($i+5))

for (( i=1; i<=5; i++ ))
do 
  SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13 ; echo '')
  curl --location --request POST http://${_NODE_ADDRESS}$i:${_PORT}$i/ignite --header 'Content-Type: application/json' --data-raw '{ "configuration": { "difficulty": '$_DIFFICULTY', "totalNodes": '$_TOTAL_NODES', "url": "'http://${_NODE_ADDRESS}$i:${_PORT}$i'", "bootstrapNodeUrl": "'$_BOOTSTRAP_NODE_URL'", "secret": "'$SECRET'", "blockCapacity": '$_BLOCK_CAPACITY', "production": "true", "miningInterval": 5000 } }'

  if [[ $_TOTAL_NODES -eq 10 ]]; then
    SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13 ; echo '')
    curl --location --request POST http://${_NODE_ADDRESS}$i:${_PORT}$(($i+5))/ignite --header 'Content-Type: application/json' --data-raw '{ "configuration": { "difficulty": '$_DIFFICULTY', "totalNodes": '$_TOTAL_NODES', "url": "'http://${_NODE_ADDRESS}$i:${_PORT}$(($i+5))'", "bootstrapNodeUrl": "'$_BOOTSTRAP_NODE_URL'", "secret": "'$SECRET'", "blockCapacity": '$_BLOCK_CAPACITY', "production": "true", "miningInterval": 5000 } }'
  fi
done

sleep 1

for (( i=1; i<=$_TOTAL_NODES; i++ ))
do  
  ./_runNodeTests.sh $i $_TOTAL_NODES &
done

