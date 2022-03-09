#!/bin/bash

source config

cd $_APP_LOCATION

# use ssh user@location before command to run if server is in a remote location.

# Kill bootstap node

PID=$(cat .pid1)
kill -9 $PID

for (( i=2; i<=$_TOTAL_NODES; i++ ))
do  
  PID=$(cat .pid$i)
  kill -9 $PID
done
