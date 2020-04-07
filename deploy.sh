INSTANCE_NAME=$1

gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo rm -rf /home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "mkdir -p /home/jupyter/share"
gcloud compute scp --recurse ./* "jupyter@${INSTANCE_NAME}:/home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "/opt/conda/bin/pip uninstall -y share_nb"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "/opt/conda/bin/pip uninstall -y share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "/opt/conda/bin/pip install /home/jupyter/share"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo service jupyter restart"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "PATH=/opt/conda/bin:/opt/conda/condabin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games && cd /home/jupyter/share && /opt/conda/bin/jupyter labextension install"
