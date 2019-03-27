# Docker @42 is a pile of s\*\*\*

## If you want to use docker on a Mac at 42, and it asks for permissions or simply breaks, you can follow these steps :

- Set up VirtualBox so that its root folder is your `goinfre`.
- Create a vm in VirtualBox :
    - Ubuntu (18.04)
    - 10 to 20GB Storage
    - 1 to 4 GB Memory (RAM)
- Download **Ubuntu 18.04 Server LTS** from [Ubuntu.com](https://www.ubuntu.com/#download). You should get an `.iso`.
- Feed that `.iso` to the VM right after you boot it for the first time.
- Set up port forwarding as follows :
    - Port name : whatever you want
    - Host Port : `3022`
    - Guest Port : `22`
    - You can leave the other fields blank if you want
- Connect to your VM using `ssh -d 3022 <your-vm-login>@localhost`.
- Copy the `id_rsa` and `id_rsa.pub` from your local machine into the vm's `.ssh` folder so that you can use your repo the way you want.
- Follow [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04) (including the optional part) to make sure Docker is set the way you want.

- Clone the repo.
- Run `docker-compose up` to build.

