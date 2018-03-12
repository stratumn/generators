#!/bin/sh

# Put the nodes together on the same chain and merge validators
# Note: you'll need jq 1.5+ on your machine: https://stedolan.github.io/jq/
jq -s ".[0].validators=([.[].validators]|flatten)|.[0]" $(pwd)/tmapp*/tendermint/config/genesis.json > $(pwd)/genesis.json

for i in `seq {{input `clusterSize`}}`
do
    cp $(pwd)/genesis.json $(pwd)/tmapp$i/tendermint/config/genesis.json
done
