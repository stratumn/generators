import subprocess
import multiprocessing
import argparse
import os
import string
import random
import signal

# This script should be called from its parent directory, using "strat run alice:<init, config, docker, up>"

rootdir = os.getcwd()
node_dir_name = "node"
nodes_number = {{input `clusterSize`}}


def print_header(message):
    print "_"*len(message)+'\n'
    print message
    print "_"*len(message)+'\n'


def exec_alice_command(node_dir, *args):
    """
    This function runs an alice command from the provided directory.
    """
    os.chdir(node_dir)
    return subprocess.check_output(["alice"] + list(args))


def set_alice_config(node_dir, key, value):
    """
    This function edits a setting of the alice configuration.
    """
    return exec_alice_command(node_dir,
                              "config",
                              "set",
                              key,
                              value,
                              "--backup=false")


def get_alice_config(node_dir, key):
    """
    This function retrieves a setting from the alice configuration.
    """
    return exec_alice_command(node_dir,
                              "config",
                              "get",
                              key)


def init_config_files():
    """
    This function creates configuration files for each node.
    It also copies a Dockerfile to the nodes directories.
    """
    print_header("INITIALIZING ALICE CONFIGURATION FILES")
    for i in range(nodes_number):
        node_dir = "%s/%s%d" % (rootdir, node_dir_name, i)
        os.mkdir(node_dir)
        print exec_alice_command(node_dir, "init")
        subprocess.call(["cp",
                         "%s/scripts/templates/Dockerfile" % rootdir,
                         node_dir])


def edit_alice_configs():
    """
    This function parses the alice.core.toml configuration file and edits
    the bootstraping node, the indigo network, the indigo store, the ports.
    """
    print_header("EDITING ALICE CONFIGURATION FILES")
    indigo_network_id = ''.join(random.choice(
        string.ascii_lowercase) for _ in range(10))
    indigo_storage_type = "{{input `indigoStore`}}"
    peers = {}
    nodes_dir = ["%s%d" % (node_dir_name, i) for i in range(nodes_number)]

    for i, node_dir in enumerate(nodes_dir):
        node_path = "%s/%s" % (rootdir, node_dir)
        peer_id = get_alice_config(node_path, "swarm.peer_id").strip()
        print "Retrieving config data for %s:%s" % (node_dir, peer_id)
        peers[peer_id] = {
            "id": peer_id,
            "node_dir": node_dir
        }

    def node_port(node_idx): return 8900+(node_idx*20)

    for i, peer in enumerate(peers.values()):
        port_range = node_port(i)
        print "Editing configuration for %s with id %s" % (
            peer["node_dir"],
            peer["id"]
        )
        node_path = "%s/%s" % (rootdir, peer["node_dir"])
        config_values = {
            "cli.api_address":  "/ip4/127.0.0.1/tcp/%d" % (port_range+4),
            "indigostore.network_id": indigo_network_id,
            "indigostore.storage_type": indigo_storage_type,
            "storage.local_storage": "data/storage/files",
            "storage.db_path":  "data/storage/db",
            "chat.history_db_path":  "data/chat-history.db",
            "coin.db_path": "data/coin/db",
            "contacts.filename": "data/contacts.toml",
            "kaddht.level_db_path": "data/kaddht",
            "log.writers.filename": "data/log.jsonld",
            "grpcapi.address": "/ip4/127.0.0.1/tcp/%d" % (port_range+4),
            "grpcweb.address": "/ip4/127.0.0.1/tcp/%d" % (port_range+6),
            "metrics.prometheus_endpoint": "/ip4/127.0.0.1/tcp/%d" % (port_range+5),
            "swarm.addresses": "/ip4/0.0.0.0/tcp/%d,/ip6/::/tcp/%d" % (port_range+3, port_range+3),
            "bootstrap.min_peer_threshold": "%d" % nodes_number,
        }
        for k, v in config_values.items():
            print "Set %s to %s for node %s" % (k, v, peer["node_dir"])
            set_alice_config(node_path, k, v)

        peer_IPs = ",".join(["/ip4/127.0.0.1/tcp/%d/ipfs/%s" % (node_port(node_idx)+3, peer_id)
                             for node_idx, peer_id in enumerate(peers.keys())
                             if peer_id != peer["id"]])
        print "Set bootstrap.addresses to %s for node %s" % (
            peer_IPs,
            peer["node_dir"]
        )
        set_alice_config(node_path, "bootstrap.addresses", peer_IPs)


def build_docker_images():
    """
    This function build a docker image for each node of the network.
    Each image gets tagged with stratumn/alice:node<N>
    """
    print_header("BUILDING DOCKER IMAGES")
    docker_image = "stratumn/alice"
    docker_tag = "node"
    for i in range(nodes_number):
        subprocess.call(["docker",
                         "build",
                         "-t",
                         "%s:%s%d" % (docker_image, docker_tag, i),
                         "%s/%s%d" % (rootdir, node_dir_name, i)])


def run_nodes():
    """
    This function runs `alice up` for each node of the network.
    Logs will be displayed in stdout and the entire network
    can be shut down using Ctrl-C.
    """
    nodes_dir = ["%s%d" % (node_dir_name, i)
                 for i in range(nodes_number)]

    subprocesses = []
    for i, node_dir in enumerate(nodes_dir):
        node_dir = "%s/%s" % (rootdir, node_dir)
        os.chdir(node_dir)
        subprocesses.append(subprocess.Popen(['alice', 'up']))

    signal.signal(signal.SIGINT, signal.SIG_IGN)
    for p in subprocesses:
        p.wait()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", help="the action you want to run",
                        type=str, choices=["init", "config", "docker", "up"])
    args = parser.parse_args()

    if args.action == "init":
        init_config_files()
    if args.action == "config":
        edit_alice_configs()
    if args.action == "docker":
        build_docker_images()
    if args.action == "up":
        run_nodes()
