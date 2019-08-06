import re, json, copy, uuid, yaml, subprocess, time
import json

import tornado.gen as gen

from notebook.utils import url_path_join, url_escape
from notebook.base.handlers import APIHandler

__version__ = '0.1.0'

GET_PROJECT_NAME_COMMAND = "curl http://metadata.google.internal/computeMetadata/v1/project/project-id -H \"Metadata-Flavor: Google\""
GET_INSTANCE_NAME_COMMAND = "curl http://metadata.google.internal/computeMetadata/v1/instance/name -H \"Metadata-Flavor: Google\""
CREATE_BUCKET_COMMAND = "gsutil mb gs://{}"
PREPARE_TMP_DIR_COMMAND = "rm -rf /tmp/nbs && mkdir /tmp/nbs"
COPY_NB_TO_TMP_DIR_COMMAND = "cp {} /tmp/nbs"
NBCONVERT_COMMAND = "cd /tmp/nbs && jupyter nbconvert --to html `find /tmp/nbs | grep ipynb`"
UPLOAD_COMMDA = "gsutil cp `find /tmp/nbs | grep htmp` {}"

GCS_BUCKET_NAME_TEMPLATE = "{}-shared-notebooks"
RESULT_GCS_PATH = "{bucket}/{instance}/{nb}/{id}/"


class ShareNbHandler(APIHandler):

    @gen.coroutine
    def post(self):
        links = {
            "sharingLink": "link1",
            "permissionsLink": "link2"
        }
        return self.finish(json.dumps(links))

    def execute_shell(self, command):
        p = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
        (output, err) = p.communicate()
        p_status = p.wait()
        return output.decode('ascii').replace("\n", "")


def _jupyter_server_extension_paths():
    return [{
        'module': 'share_nb'
    }]

def load_jupyter_server_extension(nb_server_app):
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    endpoint = url_path_join(base_url, 'share_nb')
    handlers = [(endpoint, ShareNbHandler)]
    web_app.add_handlers('.*$', handlers)
