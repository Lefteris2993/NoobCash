#!/bin/bash

# $1 is nodeId

source config

cd $_APP_LOCATION/scripts

i=$(($1-1))

input=${_APP_LOCATION}/scripts/tests/${_TOTAL_NODES}nodes/transactions$i.txt
while IFS= read -r line
do
  sleep 0.0$RANDOM
  arr=(${line// / })
  curl --location --request POST http://${_NODE_ADDRESS}$(($i%5+1)):${_PORT}$(($i+1))/transactions --header 'Content-Type: application/json' --data-raw '{ "amount": '${arr[1]}', "receiverId": '${arr[0]}' }'
done < "$input"

echo "End of file transactions$i.txt"
