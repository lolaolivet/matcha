# REMINDER

<p style="font-size:x-large">All node services share the same "node_modules/" and "package.json"<p>

## 1. Adding a new module to the project
To add new modules, add them inside of `server/.node/`

    cd server/.node
    npm install <your_module> <some_flags>

## 2. Running tests

Enter the container by running 

    docker-compose run <container_name> /bin/bash

Then inside the container run

    npm run test:integration

## 3. Building the project

At the project root, run

    npm run build

It will install all node dependencies across services