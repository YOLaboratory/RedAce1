# Do not forget to pin down the version
# FROM jupyterhub/jupyterhub
FROM jupyter/scipy-notebook

USER root

# Install dependencies (for advanced authentication and spawning)
RUN pip3 install \
    dockerspawner \
    jupyterhub-dummyauthenticator \
    jupyter_client \
    jupyterhub-nativeauthenticator

RUN mkdir -p /root/workspace/personal /root/workspace/project
# WORKDIR /root/workspace
# CMD ["jupyterhub-singleuser", "--allow-root"]






# # Do not forget to pin down the version
# # FROM jupyterhub/jupyterhub

# # RUN apt update
# # RUN apt upgrade
# RUN apt-get -y update
# RUN apt-get -y upgrade

# # error
# RUN apt-get install python3 python3-pip npm nodejs vim git

# # RUN npm install -g configurable-http-proxy

# # RUN jupyterhub --generate-config

# # RUN mkdir native_authenticator
# # RUN cd native_authenticator/
# # RUN git clone https://github.com/jupyterhub/nativeauthenticator.git
# # RUN cd nativeauthenticator/
# # RUN pip3 install -e .


# # Install dependencies (for advanced authentication and spawning)
# # RUN pip install \
# #     dockerspawner \
# #     jupyterhub-dummyauthenticator
