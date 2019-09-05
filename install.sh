#!/bin/bash
sudo pip3 install .
sudo jupyter labextension install
echo "do not forget to refresh the browser tab!"
sudo service jupyter restart
