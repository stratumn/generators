#!/usr/bin/env python
# coding: utf-8

import subprocess
import multiprocessing
import argparse
import os
import string
import random
import signal

# This script should be called from its parent directory, using "indigo-cli run node:<init, config, up>"

rootdir = os.getcwd()
node_dir_name = "node"
nodes_number = {{input `clusterSize`}}


def print_header(message):
    print "_"*len(message)+'\n'
    print message
    print "_"*len(message)+'\n'


def exec_node_command(node_dir, *args):
    """
    This function runs an indigo-node command from the provided directory.
    """
    os.chdir(node_dir)
    return subprocess.check_output(["indigo-node"] + list(args))


def set_node_config(node_dir, key, value):
    """
    This function edits a setting of the indigo node configuration.
    """
    return exec_node_command(node_dir, "config", "set", key, value, "--backup=false")


def get_node_config(node_dir, key):
    """
    This function retrieves a setting from the indigo node configuration.
    """
    return exec_node_command(node_dir, "config", "get", key)


def init_config_files():
    """
    This function creates configuration files for each node.
    """
    print_header("INITIALIZING INDIGO NODE CONFIGURATION FILES")
    for i in range(nodes_number):
        node_dir = "%s/%s%d" % (rootdir, node_dir_name, i)
        os.mkdir(node_dir)
        print exec_node_command(node_dir, "init")


def edit_node_configs():
    """
    This function parses the indigo_node.core.toml configuration file and edits
    the bootstrapping node, the indigo network, the indigo store, the ports.
    """
    print_header("EDITING INDIGO NODE CONFIGURATION FILES")
    indigo_network_id = ''.join(random.choice(
        string.ascii_lowercase) for _ in range(10))
    indigo_storage_type = "{{input `indigoStore`}}"
    peers = {}
    nodes_dir = ["%s%d" % (node_dir_name, i) for i in range(nodes_number)]

    for i, node_dir in enumerate(nodes_dir):
        node_path = "%s/%s" % (rootdir, node_dir)
        peer_id = get_node_config(node_path, "swarm.peer_id").strip()
        print "Retrieving config data for %s:%s" % (node_dir, peer_id)
        peers[peer_id] = {
            "id": peer_id,
            "node_dir": node_dir
        }

    def node_port(node_idx, service):
        service_idx = {
            "swarm": 3,
            "cli": 4,
            "grpcapi": 4,
            "metrics": 5,
            "grpcweb": 6
        }[service]
        return 8900+(node_idx*20)+service_idx

    for i, peer in enumerate(peers.values()):
        print "Editing configuration for %s with id %s" % (
            peer["node_dir"],
            peer["id"]
        )
        node_path = "%s/%s" % (rootdir, peer["node_dir"])
        config_values = {
            "cli.api_address":  "/ip4/127.0.0.1/tcp/%d" % node_port(i, "cli"),
            "indigostore.network_id": indigo_network_id,
            "indigostore.storage_type": indigo_storage_type,
            "storage.local_storage": "data/storage/files",
            "storage.db_path":  "data/storage/db",
            "chat.history_db_path":  "data/chat-history.db",
            "coin.db_path": "data/coin/db",
            "contacts.filename": "data/contacts.toml",
            "kaddht.level_db_path": "data/kaddht",
            "log.writers.filename": "data/log.jsonld",
            "grpcapi.address": "/ip4/127.0.0.1/tcp/%d" % node_port(i, "grpcapi"),
            "grpcweb.address": "/ip4/127.0.0.1/tcp/%d" % node_port(i, "grpcweb"),
            "metrics.prometheus_endpoint": "/ip4/127.0.0.1/tcp/%d" % node_port(i, "metrics"),
            "swarm.addresses": "/ip4/0.0.0.0/tcp/%d,/ip6/::/tcp/%d" % (node_port(i, "swarm"), node_port(i, "swarm")),
            "bootstrap.min_peer_threshold": "%d" % nodes_number,
        }
        for k, v in config_values.items():
            print "Set %s to %s for node %s" % (k, v, peer["node_dir"])
            set_node_config(node_path, k, v)

        peer_IPs = ",".join(["/ip4/127.0.0.1/tcp/%d/ipfs/%s" % (node_port(node_idx, "swarm"), peer_id)
                             for node_idx, peer_id in enumerate(peers.keys())
                             if peer_id != peer["id"]])
        print "Set bootstrap.addresses to %s for node %s" % (
            peer_IPs,
            peer["node_dir"]
        )
        set_node_config(node_path, "bootstrap.addresses", peer_IPs)


def run_nodes():
    """
    This function runs `indigo-node up` for each node of the network.
    Logs will be displayed in stdout and the entire network
    can be shut down using Ctrl-C.
    """
    nodes_dir = ["%s%d" % (node_dir_name, i)
                 for i in range(nodes_number)]

    subprocesses = []
    for i, node_dir in enumerate(nodes_dir):
        node_dir = "%s/%s" % (rootdir, node_dir)
        os.chdir(node_dir)
        subprocesses.append(subprocess.Popen(['indigo-node', 'up']))

    signal.signal(signal.SIGINT, signal.SIG_IGN)
    for p in subprocesses:
        p.wait()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", help="the action you want to run",
                        type=str, choices=["init", "config", "up"])
    args = parser.parse_args()

    if args.action == "init":
        init_config_files()
    if args.action == "config":
        edit_node_configs()
    if args.action == "up":
        run_nodes()
