FROM ubuntu:18.04

FROM python:3.6
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get -y update && apt-get -y upgrade && apt-get install -y \
    locales\
    curl
# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py #python3.7以上
RUN curl https://bootstrap.pypa.io/pip/3.6/get-pip.py -o get-pip.py
RUN python3 get-pip.py
RUN pip install -U pip
RUN mkdir /code
RUN rm -rf /var/lib/apt/lists/*
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 

ENV LANG en_US.utf8
WORKDIR /code
COPY requirements.txt /code/

## Dockerfile of cesium sample + new pip install...
RUN apt-get update && apt-get install -y \
    python3-gdal \
	binutils \
    gdal-bin \
    libproj-dev \
    libgdal-dev   
# RUN pip install pipenv
RUN pip install numpy
RUN pip install setuptools==57.4.0
RUN pip install -r requirements.txt
RUN export CPLUS_INCLUDE_PATH=/usr/bin/gdal
RUN export C_INCLUDE_PATH=/usr/bin/gdal

RUN apt-get install -y postgresql-client
COPY ./Pipfile /code/Pipfile
RUN pipenv install --system --skip-lock
# COPY . /code/