INSTANCE_NAME=$1

gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo rm -rf /home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "mkdir -p /home/jupyter/share"
gcloud compute scp --recurse ./* "jupyter@${INSTANCE_NAME}:/home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo pip3 uninstall -y share_nb"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo pip3 uninstall -y share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo pip3 install /home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo service jupyter restart"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "cd /home/jupyter/share && sudo jupyter labextension install"
