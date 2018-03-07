#!/bin/sh

for i in `seq {{input `clusterSize`}}`
do 
    docker run -it --rm -v "$(pwd)/tmapp$i/tendermint:/tendermint" -v "$(pwd)/arch/linux/fix-tendermint-files-ownership.sh:/tmp/fix-tendermint-files-ownership.sh" -e "UID=$(id -u)" -e "GID=$(id -g)" --entrypoint=/tmp/fix-tendermint-files-ownership.sh tendermint/tendermint:0.16.0 init
done
