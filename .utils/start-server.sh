#!/bin/bash

if ([ -z $MATCHA_ETHER_ADDRESS ] || [ -z $MATCHA_ETHER_PWD ]) && ([ -z $AWS_ACCESS_KEY_ID ] || [ -z $AWS_SECRET_ACCESS_KEY ] || [ -z $AWS_SENDER ])
then
  echo "\nNo email credentials given, defaulting to ethereal";
  echo "To use a real email, please fill out \$AWS_ACCESS_KEY_ID, \$AWS_SECRET_ACCESS_KEY and \$AWS_SENDER\n";
fi
export MATCHA_ETHER_ADDRESS=${MATCHA_ETHER_ADDRESS:-"i2jvkhayv4xr5i4j@ethereal.email"};
export MATCHA_ETHER_PWD=${MATCHA_ETHER_PWD:-"WxtDecHa1x4grqqDAp"};

if [ -z $MATCHA_PG_PWD ]
then
  echo "Database password undefined, aborting";
  echo "Please fill out \$MATCHA_PG_PWD before executing\n";
  exit 1;
fi

if [ -z $MATCHA_SECRET ]
then
  echo "\$MATCHA_SECRET not set, defaulting to 'secret123'";
  echo;
fi
export MATCHA_SECRET=${MATCHA_SECRET:-"secret123"};

if [ -z $MATCHA_SERVER_URL ]
then
  echo "\$MATCHA_SERVER_URL not set, defaulting to http://localhost:9000";
fi
export MATCHA_SERVER_URL=${MATCHA_SERVER_URL:-"http://localhost:9000"};

if [ -z $MATCHA_SOCKET_URL ]
then
  echo "\$MATCHA_SOCKET_URL not set, defaulting to http://localhost:9003";
fi
export MATCHA_SOCKET_URL=${MATCHA_SOCKET_URL:-"http://localhost:9003"};

docker-compose up -d;