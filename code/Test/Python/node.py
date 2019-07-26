import urllib
import httplib2
from xml.dom import minidom
import sys
import time
import threading
import json

'''
Performance test for Node server.
Usage: python3 node.py <concurrent_thread_number>
'''

baseurl = 'http://localhost:4000/cve_search'
query = 'CVE-2019-9978'
concurrency = int(sys.argv[1])

durations = []

def search():
    now = time.time()
    res = httplib2.Http(disable_ssl_certificate_validation=True).request(baseurl + '/','POST', body=json.dumps({'cve': query}))[1]
    duration = time.time() - now
    durations.append(duration)
    print('duration: %f ms' % (1000 * duration))

threads = []
for i in range(concurrency):
    threads.append(threading.Thread(target = search))
    threads[-1].start()

for i in range(concurrency):
    threads[i].join()

print('avg duration: %f ms' % (1000 * sum(durations) / len(durations)))

