from elasticsearch_dsl.connections import connections

connections.create_connection()

from elasticsearch_dsl import DocType, Text, Date, Search

from elasticsearch.helpers import bulk
from elasticsearch import Elasticsearch
import models


class BlogPostIndex(DocType):
    author = Text()
    posted_date = Date()
    title = Text()
    text = Text()

    class Meta:
        index = 'blogpost-index'


def bulk_indexing():
    BlogPostIndex.init(index='blogpost-index')
    es = Elasticsearch()
    bulk(client=es, actions=(b.indexing() for b in models.BlogPost.objects.all().iterator()))

def search(author):
    s = Search().filter('term', author=author)
    response = s.execute()
    return response
