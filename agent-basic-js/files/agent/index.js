{{- $fossilizer := (input "developmentFossilizer") -}}
// This file creates an Express server and mounts the agent on it.

var crypto = require('crypto');
var express = require('express');
var Agent = require('stratumn-agent');
var plugins = Agent.plugins;

// Load actions.
// Assumes your actions are in ./lib/actions.
{{- range $index, $proc := (input "process")}}
var actions_{{$proc}} = require('./lib/actions-{{$proc}}');
{{- end}}

// Create an HTTP store client to save segments.
// Assumes an HTTP store server is available on env.STRATUMN_STORE_URL or http://store:5000.
var storeHttpClient = Agent.storeHttpClient(process.env.STRATUMN_STORE_URL || 'http://store:5000');

{{- if eq $fossilizer "none" }}
// Do not use a fossilizer.
var fossilizerHttpClient = null;
{{- else }}
// Create an HTTP fossilizer client to fossilize segments.
// Assumes an HTTP fossilizer server is available on env.STRATUMN_FOSSILIZER_URL or http://fossilizer:6000.
var fossilizerHttpClient = Agent.fossilizerHttpClient(process.env.STRATUMN_FOSSILIZER_URL || 'http://fossilizer:6000');
{{- end}}


// Create an agent.
var agentUrl = process.env.STRATUMN_AGENT_URL || 'http://localhost:3000';
var agent = Agent.create({
  agentUrl: agentUrl,
});

// Adds all processes from a name, its actions, the store client, and the fossilizer client.
// As many processes as one needs can be added. A different storeHttpClient and fossilizerHttpClient may be used.
{{- range $index, $proc := (input "process")}}
agent.addProcess('{{$proc}}', actions_{{$proc}}, storeHttpClient, fossilizerHttpClient, {
{{- if ne $fossilizer "none" }}
  // the fossilizer must be able to reach the agent via this url
  evidenceCallbackUrl: process.env.STRATUMN_EVIDENCE_CALLBACK_URL || process.env.STRATUMN_AGENT_URL || 'http://agent:3000',
  // change to a unique salt
  salt: process.env.STRATUMN_SALT || crypto.randomBytes(32).toString('hex'),
{{- end}}
  // plugins you want to use
  plugins: [plugins.agentUrl(agentUrl), plugins.actionArgs, plugins.stateHash]
});
{{- end}}

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
