import os
NETWORK_NAME = os.environ['DOCKER_NETWORK_NAME']
DOCKER_JUPYTER_IMAGE = os.environ['DOCKER_JUPYTER_IMAGE']
# get the config object
c = get_config()
c.ConfigurableHTTPProxy.should_start = True
c.JupyterHub.authenticator_class = 'dummyauthenticator.DummyAuthenticator'
c.JupyterHub.hub_ip = '0.0.0.0'
c.JupyterHub.hub_connect_ip = 'jupyterhub'
c.JupyterHub.spawner_class = 'dockerspawner.SwarmSpawner'
c.JupyterHub.tornado_settings = {'slow_spawn_timeout': 30}
c.SwarmSpawner.image = DOCKER_JUPYTER_IMAGE
c.SwarmSpawner.network_name = NETWORK_NAME
c.SwarmSpawner.remove_containers = True
c.Spawner.cmd = ["jupyter", "labhub"]
c.Spawner.args = ['--allow-root']
c.Spawner.notebook_dir = '~/'
c.Spawner.debug = True
c.SwarmSpawner.debug = True
c.SwarmSpawner.host_ip = '0.0.0.0'
c.SwarmSpawner.http_timeout = 300
c.SwarmSpawner.start_timeout = 300
#c.JupyterHub.log_level = 00
#c.ConfigurableHTTPProxy.debug = True