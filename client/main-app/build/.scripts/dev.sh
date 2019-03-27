#!/bin/bash

export MATCHA_SERVER_URL=${MATCHA_SERVER_URL:-"http://localhost:9000"};
export MATCHA_SOCKET_URL=${MATCHA_SOCKET_URL:-"http://localhost:9003"};

BASEDIR=$(dirname $0);
node $BASEDIR/../dev-server.js;