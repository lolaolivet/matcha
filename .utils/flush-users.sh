#!/bin/bash
echo "This will erase all from the database"
read -r -p "Is this what you want? [y/N] " response
case "$response" in
    [yY][eE][sS]|[yY])
        echo "Flushing 🚽 ...";
        curl -X GET "http://localhost:9002/user.flush";
        echo "Done!";
        ;;
    *)
        echo "Abort";
        ;;
esac