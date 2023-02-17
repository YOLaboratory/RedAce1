# Do not forget to pin down the version
FROM jupyterhub/jupyterhub
# FROM jupyter/scipy-notebook

# Install dependencies (for advanced authentication and spawning)
RUN pip install \
    dockerspawner \
    jupyterhub-dummyauthenticator \
    notebook

# https://qiita.com/marufeuille/items/62e3a842f7a039c35aac
RUN pip install jupyter_client

USER root
RUN mkdir -p /root/workspace/personal /root/workspace/project
# WORKDIR /root/workspace
# CMD ["jupyterhub-singleuser", "--allow-root"]

