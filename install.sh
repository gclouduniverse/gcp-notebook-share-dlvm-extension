#!/bin/bash
git clone https://github.com/gclouduniverse/gcp-notebook-share-dlvm-extension.git
cd gcp-notebook-share-dlvm-extension
sudo pip3 install .
sudo jupyter labextension instal
echo "do not forget to refresh the browser tab!"
sudo service jupyter restart