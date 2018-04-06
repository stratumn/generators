#!/bin/sh

# Initialize Tendermint for each node
for i in `seq {{input `clusterSize`}}`
do 
    docker run -it --rm -v "$(pwd)/tmapp$i/tendermint:/tendermint" tendermint/tendermint:0.17.1 init
done
