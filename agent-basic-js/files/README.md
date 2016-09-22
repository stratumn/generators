# {{input "name"}}

{{input "description"}}

## Requirements

- [Docker >= 1.12 + Docker Compose](https://www.docker.com/products/docker)

## Launch dev server

Launch the containers:

```
$ strat up
```

The agent is bound to port :3000. It will automatically restart when a file is changed.

A web user interface is also available on port :4000.

Press `Ctrl^C` to stop the Docker containers.

{{with $store := (input "developmentStore") -}}
{{- with $fossilizer := (input "developmentFossilizer") -}}
{{- if eq $store "stratumn/dummystore"}}
During development and testing, the segments will be saved in memory.
They will not persist after the store is shut down.
Note that the memory storage adapter is only suited for development and testing.
{{- end}}
{{- if eq $store "stratumn/filestore"}}
During development, the segments will be saved to the `./segments` directory.
Note that the file storage adapter is very slow and only suited for development and testing.
{{- end}}
{{- if eq $store "stratumn/postgresstore"}}
During development and testing, the segments will be saved to a PostgreSQL database.
A Docker container is created for the database.
{{- end}}
{{- if eq $store "stratumn/rethinktore"}}
During development and testing, the segments will be saved to a RethinkDB database.
A Docker container is created for the database.
{{- end}}
{{- end}}
{{- end}}

## Project structure

The actions are defined in `./lib/actions.js`.
You can arrange your actions in different files then `require()` them if you want.

The tests are defined in `./test/actions`. You can also arrange them in different files if you prefer.
The `stratumn-mock-agent` module is preinstalled for easy testing of actions.

## Run tests

```
$ strat test
```

During tests, the same store and fossilizer types are launched and available.
They are started in a different namespace so that they don't conflict with the development Docker containers.
