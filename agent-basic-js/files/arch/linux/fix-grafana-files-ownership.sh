#!/bin/sh

echo Fixing grafana provisioning files ownership...

chown -R grafana:grafana /etc/grafana/provisioning
