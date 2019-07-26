# ELK-Demo: Elastic Stack + Django Demo
## Quick Start
Run Elasticsearch
```
$ ./elasticsearch/bin/elasticsearch
```
Run Kibana
```
$ ./kibana/bin/kibana
```
Run Logstash
```
$ ./logstash/bin/logstash -f logstash/tcp.conf
```
Run Djangoapp
```
$ cd elasticsearchproject
$ python manage.py runserver
```
Filebeat Input (if any):
```
./filebeat/filebeat
```
## Access
Elasticsearch:
```
http://localhost:9200
```
Logstash:
```
http://localhost:5044
```
Kibana:
```
http://localhost:5601
```
Django Admin:
```
http://localhost:8000/admin
```
