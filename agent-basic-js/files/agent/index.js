{{- $fossilizer := (input "developmentFossilizer") -}}
// This file creates an Express server and mounts the agent on it.

var crypto = require('crypto');
var express = require('express');
var Agent = require('stratumn-agent');
var plugins = Agent.plugins;

// Load actions.
// Assumes your actions are in ./lib/actions.
var actions = require('./lib/actions');

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

var agentUrl = process.env.STRATUMN_AGENT_URL || 'http://localhost:3000';

// Create an agent from the actions, the store client, and the fossilizer client.
var agent = Agent.create(actions, storeHttpClient, fossilizerHttpClient, {
{{- if ne $fossilizer "none" }}
  // the fossilizer must be able to reach the agent via this url
  evidenceCallbackUrl: process.env.STRATUMN_EVIDENCE_CALLBACK_URL || process.env.STRATUMN_AGENT_URL || 'http://agent:3000',
  // change to a unique salt
  salt: process.env.STRATUMN_SALT || crypto.randomBytes(32).toString('hex'),
{{- end}}
  // the agent needs to know its root URL
  agentUrl: agentUrl,
  // plugins you want to use
  plugins: [plugins.agentUrl(agentUrl), plugins.actionArgs, plugins.stateHash]
});

// Creates an HTTP server for the agent with CORS enabled.
var agentHttpServer = Agent.httpServer(agent, { cors: {} });

// Create the Express server.
var app = express();

app.disable('x-powered-by');

// Mount agent on the root path of the server.
app.use('/', agentHttpServer);

// Start the server.
app.listen(3000, function() {
  console.log('Listening on :' + this.address().port);
});
