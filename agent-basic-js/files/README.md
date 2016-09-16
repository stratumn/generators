# {{input "name"}}

{{input "description"}}

## Requirements

- [Docker >= 1.12 + Docker Compose](https://www.docker.com/products/docker)
- [NodeJS >= 4 (optional, for faster tests)](https://nodejs.org)

## Launch dev server

Launch the containers:

```
$ strat serve
```

The agent is bound to port :3000. It will automatically restart when a file is changed.

{{- if eq (input "developmentStore") "stratumn/filestore"}}

The segments will be saved to the `./segments` folder. Note that the file storage adapter is very slow and is suited only for development.
{{- end}}

A web user interface is also available on port :4000.

Press `Ctrl^C` to stop the containers.

## Project structure

The actions are defined in `./lib/actions.js`.
You can arrange your actions in different files then `require()` them if you want.

The tests are defined in `./test/actions`. You can also arrange them in different files if you prefer.
The `stratumn-mock-agent` module is preinstalled for easy testing of actions.

## Run tests

```
$ strat test
```

## Deploy

```
$ strat deploy production
```
