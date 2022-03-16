#!/bin/bash

# $1 is nodeId

source config

cd $_APP_LOCATION/scripts

TESTS_DIR=transactions

input=${_APP_LOCATION}/scripts/tests/${_TOTAL_NODES}nodes/transactions$(($1-1)).txt
while IFS= read -r line
do
  sleep 0.0$RANDOM
  arr=(${line// / })
  echo curl --location --request POST http://${_NODE_ADDRESS}$1:${_PORT}$1/transactions --header 'Content-Type: application/json' --data-raw '{ "amount": '${arr[1]}', "receiverId": '${arr[0]}' }'
done < "$input"

