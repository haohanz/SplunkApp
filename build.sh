#!/bin/bash

# install app
read -p "Splunk Username:" username
read -s -p "Splunk Password:" pw

splunk_bin="/Applications/Splunk/bin/splunk"
$splunk_bin start
$splunk_bin login -auth $username:$pw
$splunk_bin install app code/safemed.spl -update 1
$splunk_bin restart
$splunk_bin login -auth $username:$pw

# upload file
nexpose_idx="nexpose"
hospital_idx="hospital_data"
cwe_idx="cwe"
cve_idx="cve"
path="$(pwd)"
dataset=$path/code/Splunk_simple_search/scripts/dataset
# upload demo hospital record
$splunk_bin add index $hospital_idx
# real field, fake data
$splunk_bin remove monitor $dataset/hospital_data_v0529.csv -index $hospital_idx
$splunk_bin add monitor $dataset/hospital_data_v0529.csv -index $hospital_idx
# upload demo nexpose record
$splunk_bin add index $nexpose_idx
# fake field, fake data
$splunk_bin remove monitor $dataset/nexpose.csv -index $nexpose_idx
$splunk_bin add monitor $dataset/nexpose.csv -index $nexpose_idx
# upload cwe record
$splunk_bin add index $cwe_idx
# real field, read data
$splunk_bin remove monitor $dataset/cwe_1000.csv -index $cwe_idx
$splunk_bin add monitor $dataset/cwe_1000.csv -index $cwe_idx
# upload demo cve record
$splunk_bin add index $cve_idx
# real field, read data
$splunk_bin remove monitor $dataset/cve_cwe.csv -index $cve_idx
$splunk_bin add monitor $dataset/cve_cwe.csv -index $cve_idx

# run node server
cd code/node
npm install
DEBUG=safemed:node-server,express* node server.js $username $pw

