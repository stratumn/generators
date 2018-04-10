#!/bin/sh

tendermint_version=0.18.0

touch $PWD/dial/keys.sh

p2p_port=46656
peers=''

# Initialize Tendermint for each node
for i in `seq {{input `clusterSize`}}`; do 
    docker run -it --rm -v "$PWD/tmapp$i/tendermint:/tendermint" tendermint/tendermint:${tendermint_version} init
    # get peer id
    id=`docker run -it --rm -v "$PWD/tmapp$i/tendermint:/tendermint" tendermint/tendermint:${tendermint_version} show_node_id | dos2unix`
    # add peers for dial.sh
    echo "key$i=$id" >> $PWD/dial/keys.sh
    # add peers as persistent_peers
    test -n "$peers" && peers="$peers,"
    peers="$peers$id@tmapp$i:$p2p_port"
done

# add all peers in each tendermint node configuration
for f in $PWD/tmapp*/tendermint/config/config.toml; do
    sed "s/^persistent_peers *= *\".*\"/persistent_peers = \"$peers\"/" $f > $f.tmp
    mv $f.tmp $f
done
