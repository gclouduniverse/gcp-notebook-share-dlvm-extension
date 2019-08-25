#!/bin/bash
sudo pip3 install .
sudo jupyter labextension instal
echo "do not forget to refresh the browser tab!"
sudo service jupyter restart