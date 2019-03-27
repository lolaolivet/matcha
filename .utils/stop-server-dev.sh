#!/bin/bash

export MATCHA_SERVER_URL=${MATCHA_SERVER_URL:-"http://localhost:9000"};
docker-compose -f docker-compose.dev.yml down;