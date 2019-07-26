# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.apps import AppConfig


class ElasticsearchappConfig(AppConfig):
    name = 'elasticsearchapp'


    def ready(self):
        import elasticsearchapp.signals
