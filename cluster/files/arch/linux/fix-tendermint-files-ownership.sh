#!/bin/sh

uid=${UID:-root}
gid=${GID:-root}

chown -R $uid:$gid /tendermint
