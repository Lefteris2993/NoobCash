#!/bin/bash

# $1 is nodeId

source config

cd $_APP_LOCATION/scripts

TESTS_DIR=transactions

i=0

input=${_APP_LOCATION}/scripts/tests/${_TOTAL_NODES}nodes/transactions$(($1-1)).txt
while IFS= read -r line
do
  # i=$(($i+1))
  # if [[ $i -eq 10 ]]; then
  #   break
  # fi
  sleep 0.0$RANDOM
  arr=(${line// / })
  curl --location --request POST http://${_NODE_ADDRESS}$1:${_PORT}$1/transactions --header 'Content-Type: application/json' --data-raw '{ "amount": '${arr[1]}', "receiverId": '${arr[0]}' }'
done < "$input"

echo "End of file transactions$(($1-1)).txt"
