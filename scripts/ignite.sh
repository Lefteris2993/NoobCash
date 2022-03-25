#!/bin/bash

source config

for (( i=1; i<=$_TOTAL_NODES; i++ ))
do  
  curl -X POST http://${_NODE_ADDRESS}${i}:${_PORT}${i}/ignite
done
