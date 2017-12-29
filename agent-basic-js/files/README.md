# {{input "name"}}

{{input "description"}}

## Requirements

- [Docker >= 1.10](https://www.docker.com/products/docker)
- [Docker Compose >= 1.6](https://docs.docker.com/compose/install)

Docker Compose is already included in some distributions of Docker.

You can check versions by running:

```
$ docker version
$ docker-compose version
```

Your installation of Docker must bind containers to `127.0.0.1` in order for the
agent user interface to work properly (which should already be the case if you
are using a recent release of Docker).

To make sure that it is the case, check that the value of `$DOCKER_HOST`
(or `%DOCKER_HOST%` on Windows) is not set:

```
$ echo $DOCKER_HOST # or echo %DOCKER_HOST% on Windows
```

Also make sure Docker is running properly:

```
$ docker run hello-world
```

If your installation of Docker requires `root` permissions, you can add your
username to the `docker` group (you might need to restart your terminal after
doing so).

## Launch development server

To launch all the services locally, go to the root folder and run:

```
$ strat up
```

{{$store := (input "developmentStore") -}}
The agent is bound to `http://localhost:3000`. It will automatically restart
when a file is changed.

A web user interface for the agent is available on `http://localhost:4000`.
You can use it to test and visualize your workflows.
{{- if eq $store "tmstore" }}
A web user interface for the Indigo node is also available on
`http://localhost:8000`. You can use it to explore blocks and view transactions.
{{- end}}

Press `Ctrl^C` to stop the services.

**Note:** While the agent will automatically restart if a file changes, you will
have to run `strat up` again if you add NodeJS packages to `package.json`.

{{- $fossilizer := (input "developmentFossilizer") -}}
{{- if eq $store .dummystore}}
During development and testing, the segments will be saved in memory.
They will not persist after the store is shut down.
Note that the memory storage adapter is only suited for development and testing.
{{- end}}
{{- if or (eq $store "tmstore") (eq $store "filestore")}}
During development, the segments will be saved to the `./segments` directory.
Make sure Docker is configured to allow mounting that directory.
Note that the file storage adapter is very slow and only suited for development and
testing.
{{- end}}
{{- if eq $store "postgresstore"}}
During development and testing, the segments will be saved to a PostgreSQL database.
A Docker container is created for the database.
{{- end}}
{{- if eq $store "rethinktore"}}
During development and testing, the segments will be saved to a RethinkDB database.
A Docker container is created for the database.
{{- end}}

## Run tests

```
$ strat test
```

## Project structure

The agent's files are in the `./agent` directory.

### Workflow actions

The actions are defined in `./agent/lib/actions.js`.
You can arrange your actions in different files then `require()` them if you
want.

### Tests

The tests are defined in `./agent/test/actions`. You can also arrange them in
different files if you prefer.

During tests, the same store and fossilizer types used in development are
launched. They are started in a different namespace so that they don't conflict
with the development Docker containers.

### Configuration

There are some configuration files in `./config` that make it possible to define
environment variables for the services, including your agent.

The variables defined in `common.env` are accessible by all services during
development and testing.

The variables defined in `common.secret.env` work similarly, but will not be
included in a Git repository so it is a good place to define more sensitive
variables.

The variables defined in `dev.env` and `dev.secret.env` are only accessible
during development.

The variables defined in `test.env` and `test.secret.env` are only accessible
during testing.

### Validation

There is a json file in `./validation` named `rules.json`. 
It contains json schema validation rules that are executed for each action your processes handle.

## License

See `LICENSE` file.
