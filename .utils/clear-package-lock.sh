#!/bin/bash
echo "This will erase all package-lock.json in ./server and in ./client."
read -r -p "Is this what you want? [y/N] " response
case "$response" in
    [yY][eE][sS]|[yY])
        echo "Erasing...";
        rm -rf ./package-lock.json ./server/.dev-admin/package-lock.json ./server/api/package-lock.json ./server/chat/package-lock.json ./server/matcher/package-lock.json ./server/serve-client/package-lock.json ./client/landing/package-lock.json ./client/main-app/package-lock.json;
        echo "Done!";
        ;;
    *)
        echo "Abort";
        ;;
esac