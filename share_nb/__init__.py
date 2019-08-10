import re, json, copy, uuid, yaml, subprocess, time
import json

import tornado.gen as gen

from notebook.utils import url_path_join, url_escape
from notebook.base.handlers import APIHandler

__version__ = '0.1.0'

GET_PROJECT_NAME_COMMAND = "curl http://metadata.google.internal/computeMetadata/v1/project/project-id -H \"Metadata-Flavor: Google\""
GET_INSTANCE_NAME_COMMAND = "curl http://metadata.google.internal/computeMetadata/v1/instance/name -H \"Metadata-Flavor: Google\""


class ShareNbHandler(APIHandler):

    def get_bucket_name(self):
        project_name = self.execute_shell(GET_PROJECT_NAME_COMMAND)
        bucket_name = project_name + '-notebooks'
        return bucket_name

    def get_instance_name(self):
        return self.execute_shell(GET_INSTANCE_NAME_COMMAND)

    @gen.coroutine
    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        path = data["notebook_path"]
        # path = "\"" + path + "\""
        public = data["public"]

        #converting current notebook to html format
        self.execute_shell('jupyter nbconvert --to html ' + path) 
       
        html_path = path[0:len(path)-5] + 'html'

        self.execute_shell('gsutil mb ' + 'gs://' + self.get_bucket_name()) 
        # self.execute_shell('jupyter rm ' + self.get_bucket_name())

        bucket_name = self.get_bucket_name()
        instance_name = self.get_instance_name()

        full_gcs_path = bucket_name + '/' + instance_name + '/' + html_path
        self.execute_shell('gsutil cp ' + html_path + ' ' +  'gs://' + full_gcs_path) 

        # delete the html file after it has been uploaded to GCS
        self.execute_shell(' rm ' + html_path)

        sharing_link = 'https://storage.cloud.google.com/' + full_gcs_path 

        permission_link = 'https://console.cloud.google.com/storage/browser/_details/' + full_gcs_path 

        if public:
            self.execute_shell('gsutil acl ch -u AllUsers:R gs://' + full_gcs_path)

        links = {
            "sharingLink": sharing_link,
            "permissionsLink": permission_link
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
