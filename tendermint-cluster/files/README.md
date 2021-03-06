# {{.dir}}

This project is a test Indigo Tendermint Node cluster.

It runs a sample Indigo Agent, with {{input "clusterSize"}} nodes and standard monitoring tools.

## Requirements

* [Docker >= 1.10](https://www.docker.com/products/docker)
* [Docker Compose >= 1.6](https://docs.docker.com/compose/install)
* [jq >= 1.5](https://stedolan.github.io/jq/)

Docker Compose is already included in some distributions of Docker.

You can check versions by running:

```sh
docker version
docker-compose version
```

Your installation of Docker must bind containers to `127.0.0.1` in order for the
agent user interface to work properly (which should already be the case if you
are using a recent release of Docker).

To make sure that it is the case, check that the value of `$DOCKER_HOST`
(or `%DOCKER_HOST%` on Windows) is not set:

```sh
echo $DOCKER_HOST # or echo %DOCKER_HOST% on Windows
```

Also make sure Docker is running properly:

```sh
docker run hello-world
```

If your installation of Docker requires `root` permissions, you can add your
username to the `docker` group (you might need to restart your terminal after
doing so).

## Launch development cluster

To launch the development cluster locally, go to the root folder and run:

```sh
indigo-cli up
```

A web user interface for the agent is available on `http://localhost:4000`.
You can use it to test and visualize your workflows.

A web user interface for the Indigo node is also available on
`http://localhost:8000`. You can use it to explore blocks and view transactions.

Press `Ctrl^C` to stop the services.

{{$tmstore := (input "tmpopUnderlyingStore") -}}
{{- if eq $tmstore "dummytmpop"}}
During development and testing, the segments will be saved in memory.
They will not persist after the store is shut down.
Note that the memory storage adapter is only suited for development and testing.
{{- end}}
{{- if eq $tmstore "filetmpop"}}
During development, the segments will be saved to the `./segments` directory.
Make sure Docker is configured to allow mounting that directory.
Note that the file storage adapter is very slow and only suited for development and
testing.
{{- end}}
{{- if eq $tmstore "postgrestmpop"}}
During development and testing, the segments will be saved to a PostgreSQL database.
A Docker container is created for the database.
{{- end}}
{{- if eq $tmstore "rethinktmpop"}}
During development and testing, the segments will be saved to a RethinkDB database.
A Docker container is created for the database.
{{- end}}
{{- if eq $tmstore "elasticsearchtmpop"}}
During development and testing, the segments will be saved to a ElasticSearch database.
A Docker container is created for the database.
{{- end}}

## Monitoring

If you chose to configure monitoring, Indigo components will exports metrics and traces.
We use [OpenCensus](https://opencensus.io) to generate metrics and traces.
A Prometheus agent collects the metrics and a Grafana agent provides some pre-configured dashboards to visualize them.
We use [Jaeger](https://github.com/jaegertracing/jaeger) to visualize traces.

The Grafana endpoint can be found at [http://localhost:7000](http://localhost:7000).
The default _user/password_ is _admin/admin_.

The Jaeger endpoint can be found at [http://localhost:16686](http://localhost:16686).

## Project structure

### Configuration

There are some configuration files in `./config` that make it possible to define
environment variables for the services.

The variables defined in `common.env` are accessible by all services during
development and testing.

The variables defined in `common.secret.env` work similarly, but will not be
included in a Git repository so it is a good place to define more sensitive
variables.

The variables defined in `dev.env` and `dev.secret.env` are only accessible
during development.

### Dial

The `dial` folder contains scripts that are executed when the cluster starts.
It connects nodes together in a mesh network.

## License

See `LICENSE` file.
