#!/bin/bash

sudo apt-get update
yes Y | sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key add -
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt-get update
apt-cache policy docker-ce
sudo apt-get install docker-ce
sudo usermod -aG docker ${USER} 2> /dev/null
su - ${USER}
yes Y | sudo apt-get install docker-compose
yes Y | sudo apt-get install nodejs npm
yes Y | sudo npm i -g npx
