#!/bin/bash

#
# Ask for user login
echo "Hello $USER ❤️"
echo "A friendly reminder : this virtual machine is for use on the iMacs at 42."
userlogin=$USER
goinfre="/Volumes/Storage/goinfre/$userlogin"

while :
do
  #
  # Check that goinfre exists
  if [ ! -d $goinfre ]
  then
    echo "\nCannot find goinfre at $goinfre"
    echo "Please enter your 42 login"
    #
    # If goinfre is unavailable, maybe it is because the userlogin
    # is not correct ask for user input
    read -p 'login: ' userlogin
    #
    # Validate name
    if ! [[ $userlogin =~ ^[a-z0-9_-]{2,10}$ ]];
    then
      echo "\nThis is not a correct login"
      echo "(Regex for a valid login : ^[a-z0-9_-]{2,10}$)"
      echo "Please try again."
      continue
    else
      goinfre="/Volumes/Storage/goinfre/$userlogin"
      continue
    fi
  else
    break
  fi
done

#
# Create the file in goinfre
dir="$goinfre/vagrant"

if [ ! -d "$dir" ]
then
  mkdir $dir
fi

if [ -z $VAGRANT_HOME ]
then
  VAGRANT_HOME=$dir
  echo "export VAGRANT_HOME=$dir" >> ~/.zshrc
fi

#
# Create the config file
if [ ! -f "./Vagrantfile" ]
then
  echo 'Vagrant.configure("2") do |config|
          config.vm.provider "virtualbox" do |v|
            v.name = "ubuntu_docker_matcha"
            v.gui = false
          end
          config.vm.box = "generic/ubuntu1804"
          config.vm.synced_folder "..", "/home/vagrant/matcha"
          config.vm.provision "docker",
              images: ["ubuntu"]
          config.vm.network "forwarded_port", guest: 22, host: 3022
          config.vm.network "forwarded_port", guest: 9000, host: 9000
          config.vm.network "forwarded_port", guest: 9001, host: 9001
          config.vm.network "forwarded_port", guest: 9002, host: 9002
          config.vm.network "forwarded_port", guest: 9003, host: 9003
          config.vm.network "forwarded_port", guest: 9004, host: 9004
          config.vm.network "forwarded_port", guest: 3000, host: 3000
          config.vm.provision "shell", path: "docker-config.sh"
        end' > "./Vagrantfile"
fi

afplay ./other/wait.mp3 &
vagrant plugin install vagrant-vbguest
vagrant up --provider virtualbox
vagrant vbguest
vagrant ssh
