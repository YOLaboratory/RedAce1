# import os
# NETWORK_NAME = os.environ['DOCKER_NETWORK_NAME']
# DOCKER_JUPYTER_IMAGE = os.environ['DOCKER_JUPYTER_IMAGE']




# # get the config object
# c = get_config()
# c.ConfigurableHTTPProxy.should_start = True
# c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
# c.JupyterHub.hub_ip = '0.0.0.0'
# c.JupyterHub.hub_connect_ip = 'jupyterhub'
# c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
# c.JupyterHub.tornado_settings = {'slow_spawn_timeout': 30}
# c.SwarmSpawner.image = DOCKER_JUPYTER_IMAGE
# c.SwarmSpawner.network_name = NETWORK_NAME
# c.SwarmSpawner.remove_containers = True
# c.Spawner.cmd = ["jupyter", "labhub"]
# c.Spawner.args = ['--allow-root']
# c.Spawner.notebook_dir = '~/'
# c.Spawner.debug = True
# c.SwarmSpawner.debug = True
# c.SwarmSpawner.host_ip = '0.0.0.0'
# c.SwarmSpawner.http_timeout = 300
# c.SwarmSpawner.start_timeout = 300
# #c.JupyterHub.log_level = 00
#c.ConfigurableHTTPProxy.debug = True


# from jupyter_client.localinterfaces import public_ips
# c.JupyterHub.hub_ip = public_ips()[0]
# c.JupyterHub.port = 8888
# c.DockerSpawner.remove_containers = True
# c.DockerSpawner.hub_ip_connect = public_ips()[0]
# c.Spawner.http_timeout = 30


# # JupyterHub自体はlocalhostで起動
# c.JupyterHub.ip = '127.0.0.1'

# # Adminユーザを任意の名前で指定
# c.Authenticator.admin_users = {'jupyter'}

# # DBはSQLite3
# # c.JupyterHub.db_url = 'sqlite:////etc/jupyterhub/jupyterhub.sqlite'

# # NativeAuthenticatorを指定
# c.JupyterHub.authenticator_class = 'nativeauthenticator.NativeAuthenticator'

# # DockerSpawner関係の設定
# c.JupyterHub.hub_connect_ip = '<jupyterhub-server-ip>'
# c.JupyterHub.hub_ip = '0.0.0.0'
# c.JupyterHub.hub_port = 8081
# c.JupyterHub.spawner_class = 'dockerspawner.DockerSpawner'
# c.DockerSpawner.hub_connect_ip = '10.0.1.4'

# ## pandas、matplotlib、seaborn、scikit-learnなどが含まれたscipy-notebookを採用
# ## https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-scipy-notebook
# c.DockerSpawner.image = DOCKER_JUPYTER_IMAGE #'jupyter/scipy-notebook:6c3390a9292e'

# ## ノートブックの永続化設定
# notebook_dir = '/home/jovyan/work'
# c.DockerSpawner.notebook_dir = notebook_dir
# c.DockerSpawner.volumes = { 'jupyterhub-user-{username}': notebook_dir }





# c.JupyterHub.authenticator_class = 'jupyterhub.auth.PAMAuthenticator'

# from jupyter_client.localinterfaces import public_ips
# c.JupyterHub.hub_ip = public_ips()[0]
# c.JupyterHub.port = 8888

# from dockerspawner import DockerSpawner
# import pwd, os, grp
# class MyDockerSpawner(DockerSpawner):
#     def start(self):
#         name = self.user.name
#         user_data = pwd.getpwnam(name)
#         gid_list = os.getgrouplist(name, user_data.pw_gid)

#         self.volumes['jupyterhub-user-{username}'] = notebook_dir + '/personal'

#         for gid in gid_list:
#             gname = grp.getgrgid(gid).gr_name
#             if gname.startswith("project-"):
#                 dirname = gname.replace("project-", "")
#                 self.volumes[gname] = notebook_dir + "/project/" + dirname

#         return super().start()

# c.JupyterHub.spawner_class = MyDockerSpawner
# c.DockerSpawner.image = DOCKER_JUPYTER_IMAGE
# c.DockerSpawner.remove_containers = True

# c.DockerSpawner.network_name = NETWORK_NAME

# c.DockerSpawner.hub_ip_connect = public_ips()[0]

# c.Spawner.http_timeout = 30
# c.Authenticator.admin_users = set()
# c.PAMAuthenticator.open_sessions = False

# notebook_dir = '/root/workspace'
# c.DockerSpawner.notebook_dir = notebook_dir




# import os

# # https://qiita.com/marufeuille/items/62e3a842f7a039c35aac
# image_name   = os.environ['DOCKER_JUPYTER_IMAGE'] # "YOUR_CONTAINER_IMAGE_NAME"
# network_name = os.environ['DOCKER_NETWORK_NAME'] # "YOUR_DOCKER_NETWORK_NAME"

# c = get_config()

# c.JupyterHub.authenticator_class = 'jupyterhub.auth.PAMAuthenticator'
# # c.JupyterHub.authenticator_class = 'Dummyauthenticator.DummyAuthenticator' # テスト目的用、パスワードなしの任意ユーザ名でログイン可

# from jupyter_client.localinterfaces import public_ips
# # c.JupyterHub.hub_ip = public_ips()[0]
# # c.JupyterHub.port = 8888
# c.JupyterHub.hub_ip = '0.0.0.0'  #
# c.JupyterHub.hub_connect_ip = 'jupyterhub'  #

# from dockerspawner import DockerSpawner
# import pwd, grp
# class MyDockerSpawner(DockerSpawner):
#     def start(self):
#         name = self.user.name
#         user_data = pwd.getpwnam(name)
#         gid_list = os.getgrouplist(name, user_data.pw_gid)

#         self.volumes['jupyterhub-user-{username}'] = notebook_dir + '/personal'

#         for gid in gid_list:
#             gname = grp.getgrgid(gid).gr_name
#             if gname.startswith("project-"):
#                 dirname = gname.replace("project-", "")
#                 self.volumes[gname] = notebook_dir + "/project/" + dirname

#         return super().start()

# c.JupyterHub.spawner_class = MyDockerSpawner
# c.DockerSpawner.image = image_name
# c.DockerSpawner.remove_containers = True

# c.DockerSpawner.network_name = network_name

# c.DockerSpawner.hub_ip_connect = public_ips()[0]

# c.Spawner.http_timeout = 30
# c.Authenticator.admin_users = set()
# c.PAMAuthenticator.open_sessions = False

# notebook_dir = '/root/workspace'
# c.DockerSpawner.notebook_dir = notebook_dir
# c.DockerSpawner.cmd = ["jupyter", "labhub"] #
# c.DockerSpawner.args = ['--allow-root']     #

# c.Spawner.debug = True  #
# c.DockerSpawner.debug = True  #
# c.DockerSpawner.host_ip = '0.0.0.0'  #





c.LocalAuthenticator.create_system_users=True
c.Authenticator.delete_invalid_users = True


# ログイン後に http://...:8000/user/<username>/lab? へ遷移する設定（Jupyterlabが起動）
c.Spawner.default_url = '/lab'
# Jupyterlabで作成されたノートブックファイルなどが格納されるディレクトリ
c.Spawner.notebook_dir = '~/notebook'
# adminユーザのユーザ名
c.Authenticator.admin_users = {'testadmin'}
# ログインが許可されているユーザ名
c.Authenticator.allowed_users = {'testuser01'}