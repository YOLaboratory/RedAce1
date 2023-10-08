#!/bin/bash
sleep 5
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
# ここで読込
# uwsgi --ini /server/config/uwsgi.ini
uwsgi --socket :8001 --module mars_gis_django.wsgi