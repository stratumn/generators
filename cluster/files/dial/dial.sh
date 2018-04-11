#!/bin/sh

# --------------------------------------
# - Dial script for tendermint network -
# --------------------------------------

# The script calls `/dial_seeds` on all nodes in the network.
# In a network of `total_seeds` nodes, each node connects to `total_seeds/2` nodes.
# Similarly, each node receives connections from the other half of the network.
# That ensures that the connection graph is symmetric and balanced,
# i.e. each node has `total_seeds/2` outbound and `total_seeds/2` inbound seeds.

rootdir=`dirname $0`

total_seeds={{input "clusterSize"}}
core_prefix=tmapp
p2p_port=46656
rpc_port=46657

if [[ ${total_seeds} -le 1 ]]; then
    echo "not a network, exiting"
    exit 1
fi

sleep 5
echo 'Trying to create p2p meshed connections'

for i in `seq ${total_seeds}`; do
    seeds=""
    for j in `seq $(((${total_seeds} - 1) / 2))`; do
        idx=$(((${i} + ${j} - 1) % ${total_seeds} + 1))
        key=`sed -n "s/key$idx=\(.*\)/\1/p" $rootdir/keys.sh`
        seed=${core_prefix}${idx}
        seeds="${seeds} ${key} ${seed}"
        [[ ${total_seeds} -eq 2 ]] && break
    done
    echo "${core_prefix}${i} connects to ${seeds}"
    json_msg="seeds=["$(l=$(printf ",\"%s@%s:${p2p_port}\"" ${seeds}); echo ${l:1})"]"
    url="${core_prefix}${i}:${rpc_port}/dial_seeds"
    curl --data-urlencode "${json_msg}" "${url}"
    echo
    sleep 1
done
