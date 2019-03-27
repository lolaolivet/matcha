#!/bin/bash
echo "This will erase all node_modules in ./server and in ./client."
read -r -p "Is this what you want? [y/N] " response
case "$response" in
    [yY][eE][sS]|[yY])
        echo "Erasing...";
        rm -rf ./server/.dev-admin/node_modules ./server/api/node_modules ./server/chat/node_modules ./server/matcher/node_modules ./server/serve-client/node_modules ./client/landing/node_modules ./client/main-app/node_modules;
        echo "Done!";
        ;;
    *)
        echo "Abort";
        ;;
esac