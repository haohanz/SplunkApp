# Node Server
### Install
```
$ npm install
```
### Run
Set your Splunk username & password in server.js, then run the following command line:
```
$ DEBUG=safemed:node-server,express* node server.js
```
### Request & Response
URI: /cve_search

Workflow:
- Get Splunk's POST request, sample request json:
```
{ cve: 'CVE-2018-16116'}
```

- Check required fields already existing or not
    - If exist: 
        - response the existing records & fields
    - If not:
        - Send https request to NVD
        - Use htmlparser to parse html content, grep useful info
        - Save content into Splunk
        - Respond to Splunk
- Sample response json:
```
{ cwe: 'CWE-89',
'vuln-description':
'SQL injection vulnerability in AccountStatus.jsp in Admin Portal of Sophos XG firewall 17.0.8 MR-8 allow remote authenticated attackers to execute arbitrary SQL commands via the "username" GET parameter.',
'vuln-cvssv3-base-score': '8.8',
'vuln-cvssv3-base-score-severity': 'HIGH',
'vuln-cvssv3-impact-score': '5.9',
'vuln-cvssv3-exploitability-score': '2.8',
'vuln-cvssv3-av': 'Network',
'vuln-cvssv3-ac': 'Low',
'vuln-cvssv3-pr': 'Low',
'vuln-cvssv3-ui': 'None',
'vuln-cvssv3-s': 'Unchanged',
'vuln-cvssv3-c': 'Partial',
'vuln-cvssv3-i': 'High',
'vuln-cvssv3-a': 'High',
'vuln-cvssv2-base-score': '6.5',
'vuln-cvssv2-base-score-severity': 'MEDIUM',
'vuln-cvssv2-impact-subscore': '6.4',
'vuln-cvssv2-exploitability-score': '8.0',
'vuln-cvssv2-additional': 'Victim must voluntarily interact with attack mechanism\nAllows unauthorized modification\n\n',
'vuln-technical-details-0-link': 'SQL Injection' }
```
Where 'vuln-technical-details-0-link' is vulnerability name.
