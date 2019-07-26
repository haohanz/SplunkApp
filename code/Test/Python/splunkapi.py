import urllib
import httplib2
from xml.dom import minidom
import sys
import time
import threading

'''
Performance test for SafeMed Splunk application's search function using Splunk RESTful API.
Usage: python3 splunkapi.py <query_index> <concurrent_thread_number>
'''

baseurl = 'https://localhost:8089'
userName = 'admin'
password = 'password'
queries = [
        'index="hospital_data" | rename "IP Address 1" as HOST | join HOST type=inner [search index="nexpose" | rename "extracted_Host" as HOST] | join cve type=outer [search index=cve ] | join cwe type=outer [search index=cwe cwe=*] | fields "Manufacturer", "Model", "cwe", "vuln_technical_details_0_link"',
        '"Manufacturer_3" index="hospital_data" | rename "IP Address 1" as HOST | join HOST type=inner [search index="nexpose" | rename "extracted_Host" as HOST] | join cve type=outer [search index=cve ] | join cwe type=outer [search index=cwe cwe=* ]',
        '"Manufacturer_3" "Model_12" index="hospital_data" | rename "IP Address 1" as HOST | join HOST type=inner [search index="nexpose" | rename "extracted_Host" as HOST] | join cve type=outer [search index=cve ] | join cwe type=outer [search index=cwe cwe=* ]',
        '"Manufacturer_3" "Model_12" index="hospital_data" | rename "IP Address 1" as HOST | join HOST type=inner [search index="nexpose" | rename "extracted_Host" as HOST] | join cve type=inner [search index=cve cwe=* "CWE-78"]',
        'index=nexpose | head 100',
        'index="hospital_data"']
searchQuery = queries[int(sys.argv[1])]
concurrency = int(sys.argv[2])

# Authenticate with server.
# Disable SSL cert validation. Splunk certs are self-signed.
serverContent = httplib2.Http(disable_ssl_certificate_validation=True).request(
        baseurl + '/services/auth/login',
        'POST',
        headers={},
        body=urllib.parse.urlencode({'username':userName, 'password':password}))[1]

sessionKey = minidom.parseString(serverContent).getElementsByTagName('sessionKey')[0].childNodes[0].nodeValue

# Remove leading and trailing whitespace from the search
searchQuery = searchQuery.strip()

# If the query doesn't already start with the 'search' operator or another 
# generating command (e.g. "| inputcsv"), then prepend "search " to it.
if not (searchQuery.startswith('search') or searchQuery.startswith("|")):
    searchQuery = 'search ' + searchQuery

print(searchQuery)
durations = []

# Run the search.
# Again, disable SSL cert validation.
def search():
    sid = httplib2.Http(disable_ssl_certificate_validation=True).request(baseurl + '/services/search/jobs','POST',
        headers={'Authorization': 'Splunk %s' % sessionKey},body=urllib.parse.urlencode({'search': searchQuery}))[1]
    sid = sid.split(b'sid')[1][1: -2]
    time.sleep(10)
    job_detail = httplib2.Http(disable_ssl_certificate_validation=True).request(baseurl + '/services/search/jobs/' + sid.decode(),'GET',
        headers={'Authorization': 'Splunk %s' % sessionKey})[1].decode()
    duration = job_detail[job_detail.find('runDuration') + 13: ]
    duration = duration[: duration.find('\n') - 9]
    durations.append(float(duration))
    print('duration: %f ms' % (1000 * float(duration)))

threads = []
for i in range(concurrency):
    threads.append(threading.Thread(target = search))
    threads[-1].start()

for i in range(concurrency):
    threads[i].join()

print('avg duration: %f ms' % (1000 * sum(durations) / len(durations)))

