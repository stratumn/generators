#!/bin/sh

echo Fixing monitoring files ownership...

docker run -it --rm -v "$(pwd)/monitoring/grafana/provisioning:/etc/grafana/provisioning" -v "$(pwd)/arch/linux/fix-grafana-files-ownership.sh:/tmp/fix-grafana-files-ownership.sh" --entrypoint=/tmp/fix-grafana-files-ownership.sh grafana/grafana -v
