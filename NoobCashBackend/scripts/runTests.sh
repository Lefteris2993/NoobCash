#!/bin/bash

source config

cd $_APP_LOCATION/scripts

for (( i=1; i<=$_TOTAL_NODES; i++ ))
do  
  ./_runNodeTests.sh $i &
done
