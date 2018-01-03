#!/bin/sh

# Initialize Tendermint for each node
for i in `seq {{input `clusterSize`}}`
do 
    docker run -it --rm -v "$(pwd)/tmapp$i/tendermint:/tendermint" tendermint/tendermint:0.13.0 init
done

# Put the nodes together on the same chain
# Note: you'll need jq 1.5+ on your machine: https://stedolan.github.io/jq/
jq -s ".[0].validators=([.[].validators]|flatten)|.[0]" $(pwd)/tmapp*/tendermint/genesis.json > $(pwd)/genesis.json

for i in `seq {{input `clusterSize`}}`; do
    cp $(pwd)/genesis.json $(pwd)/tmapp$i/tendermint/genesis.json
done
