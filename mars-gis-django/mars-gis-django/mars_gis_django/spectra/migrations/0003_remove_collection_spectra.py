# Generated by Django 2.1.5 on 2019-01-25 07:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('spectra', '0002_auto_20190125_0455'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='collection',
            name='spectra',
        ),
    ]
