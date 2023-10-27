#!/bin/bash

echo_info () {
    echo $1
}

# Updating packages
echo_info "UPDATES-BEING-INSTALLED"
sudo apt update && sudo apt upgrade -y

source ~/.bashrc

# Installing node server
echo_info "INSTALLING-NODEJS"
sudo apt install -y nodejs npm

# Installing unzip
echo_info "INSTALLING-UNZIP"
sudo apt install -y unzip

cd /opt
unzip webapp.zip
rm webapp.zip
cd webapp
mv users.csv /opt/
npm i

# Starting the service

sudo sh -c "echo '[Unit]
Description=My NPM Service
Requires=cloud-init.target
After=cloud-final.service

[Service]
EnvironmentFile=/etc/environment
Type=simple
User=admin
WorkingDirectory=/opt/
ExecStart=/usr/bin/node /opt/app.js
Restart=always
RestartSec=10

[Install]
WantedBy=cloud-init.target' | sudo tee /etc/systemd/system/webapp.service"

sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl status webapp