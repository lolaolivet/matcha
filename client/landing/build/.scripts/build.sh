#!/bin/bash

export MATCHA_SERVER_URL=${MATCHA_SERVER_URL:-"http://localhost:9000"};
BASEDIR=$(dirname $0);
node $BASEDIR/../build.js;