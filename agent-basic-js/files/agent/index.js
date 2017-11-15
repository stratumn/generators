{{- $fossilizers := (input "developmentFossilizer") -}}
// This file creates an Express server and mounts the agent on it.

const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const Agent = require('stratumn-agent');
const plugins = Agent.plugins;

// Create an HTTP store client to save segments.
// Assumes an HTTP store server is available on env.STRATUMN_STORE_URL or http://store:5000.
const storeHttpClient = Agent.storeHttpClient(process.env.STRATUMN_STORE_URL || 'http://store:5000');

const fossilizerHttpClients = [];
{{- range $i, $fossilizer := $fossilizers}}
// Create an HTTP fossilizer client to fossilize segments.
// Assumes an HTTP fossilizer server is available on env.STRATUMN_FOSSILIZER_URL or 'http://{{$fossilizer}}:{{(add 6000 $i)}}'.
fossilizerHttpClients.push(Agent.fossilizerHttpClient(process.env.STRATUMN_FOSSILIZER_URL || 'http://{{$fossilizer}}:{{(add 6000 $i)}}'));
{{- end}}

// Create an agent.
const agentUrl = process.env.STRATUMN_AGENT_URL || 'http://agent:3000';
const agent = Agent.create({
  agentUrl: agentUrl
});

// List of plugins used for our process actions
const processPlugins = [plugins.agentUrl(agentUrl), plugins.actionArgs, plugins.stateHash, plugins.agentVersion];

// Load process actions.
// Assumes your action files are in ./lib/actions and export a 'name' field.
fs.readdir('./lib/actions', (err, processFiles) => {
  if (err) {
    console.error(`Cannot load process actions: ${err}`);
    return;
  }

  processFiles.forEach(file => {
    const actions = require(`./lib/actions/${file}`);
    if (!actions.name) {
      console.log(`Process ${file} doesn't export a 'name' field. Skipping...`);
      return;
    }

    try {
      agent.addProcess(
        actions.name,
        actions,
        storeHttpClient,
        fossilizerHttpClients,
        {
{{- if $fossilizers }}
          // the fossilizer must be able to reach the agent via this url
          evidenceCallbackUrl: process.env.STRATUMN_EVIDENCE_CALLBACK_URL || agentUrl,
          // change to a unique salt
          salt: process.env.STRATUMN_SALT || crypto.randomBytes(32).toString('hex'),
{{- end}}
          plugins: processPlugins
        }
      );
    } catch (err) {
      console.error(`Could not load process: ${actions.name}`);
    }
  });
});

// Creates an HTTP server for the agent with CORS enabled.
var agentHttpServer = Agent.httpServer(agent, { cors: {} });

// Create the Express server.
var app = express();

app.disable('x-powered-by');

// Mount agent on the root path of the server.
app.use('/', agentHttpServer);

// Create server by binding app and websocket connection
const server = Agent.websocketServer(app, storeHttpClient);

// Start the server.
server.listen(3000, function() {
  console.log('Listening on :' + this.address().port);
});
