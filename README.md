# Extensions For Sharing Notebook

## Prerequisites

* Cloud AI Deep Learning VM
* AI Platform Notebook Instance

## Installation Remote

```bash
INSTANCE_NAME=... # Namve of either AI Platform Notebook instance or Cloud AI Deep Learning VM
git clone https://github.com/gclouduniverse/gcp-notebook-share-dlvm-extension.git
cd gcp-notebook-share-dlvm-extension
./deploy.sh "${INSTANCE_NAME}"
```

## Installations From The AI Platform Notebooks

* Open AI Platform Notebook Jupyter Lab
* Open Terminal
* Run the following commands:
   * ```git clone https://github.com/gclouduniverse/gcp-notebook-share-dlvm-extension.git```
   * ```cd gcp-notebook-share-dlvm-extension```
   * ```sudo pip3 install .```
   * ```sudo jupyter labextension install```
   * ```sudo service jupyter restart```
* Refresh browser tab