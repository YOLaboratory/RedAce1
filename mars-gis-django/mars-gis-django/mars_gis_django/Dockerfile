# FROM python:3.8
# ENV PYTHONUNBUFFERED 1
# RUN mkdir /code
# WORKDIR /code
# COPY requirements.txt /code/
# RUN pip install -r requirements.txt
# COPY . /code/



FROM ubuntu:18.04

## Dockerfile of cesium sample 
FROM python:3.6
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
##

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y locales curl python3-distutils
# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py #python3.7以上
RUN curl https://bootstrap.pypa.io/pip/3.6/get-pip.py -o get-pip.py
RUN python3 get-pip.py
RUN pip install -U pip
RUN mkdir /code
RUN rm -rf /var/lib/apt/lists/*
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 


ENV LANG en_US.utf8
WORKDIR /code
# ADD requirements.txt /code
COPY requirements.txt /code/


## Dockerfile of cesium sample + new pip install...
RUN pip install pipenv
RUN pip install numpy
RUN apt-get update && apt-get install -y \
    python3-gdal \
	binutils \
    gdal-bin \
    libproj-dev \
    libgdal-dev    
RUN pip install -r requirements.txt
RUN export CPLUS_INCLUDE_PATH=/usr/bin/gdal
RUN export C_INCLUDE_PATH=/usr/bin/gdal

## notebook
# RUN pip install django-extensions

# RUN pip uninstall gdal
# RUN pip install numpy
# RUN pip install GDAL==$(gdal-config --version) --global-option=build_ext --global-option="-I/usr/bin/gdal"
# RUN pip install -r requirements.txt    
   
RUN apt-get install -y postgresql-client
COPY ./Pipfile /code/Pipfile
RUN pipenv install --system --skip-lock
COPY . /code/
##