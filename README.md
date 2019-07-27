# SafeMed Splunk Application 
[![Build Status](https://travis-ci.com/haohanz/SplunkApp.svg?branch=develop)](https://travis-ci.com/haohanz/SplunkApp) ![version](https://img.shields.io/badge/version-1.4.2-blue) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Summary
A customized Splunk application for medical device vulnerability search and aggregation of Rapid7 Nexpose records, hospital records, Mitre and NVD database using Splunk API, Javascript, Node.js, and XML. 

Built Splunk backend and node server with Splunk Javascript API and Node.js, applied unit test using Artillery, performance test using Splunk RESTful API, and workflow test using Selenium.

## Overview
- Aggregate Page
    * View aggregated results of device info and vulnerability name
- Search Page
    * Search by vulnerability keyword -> View related devices
    * Search by CVE-ID/CWE-ID -> View related devices
- File Upload Page
    * File upload
    * Create index for file storage
- Visualization Page
    * Charts and diagrams for aggregated data
- Other features:
    * Click on Nexpose fields (e.g. "host") to search for filtered hospital records
    * Click on Hospital fields to search for filtered and aggregated nexpose & hospital results
    * Click on manufacturer or manufacturer & model to see aggregated results

## Supported OS
- Max OS
- Linux
- Windows

## Data Schema
- Nexpose
- Hospital (stored with IP)
- CVE
- CWE (vulnerability type)
![Data Schema](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_dataset.png)


## Installation
#### Prerequisites
- [Install Splunk](https://www.splunk.com/en_us/download/splunk-enterprise.html?utm_campaign=bing_amer_en_search_brand&utm_source=bing&utm_medium=paidsearch&utm_term=%2Bsplunk%20%2Bdownload&utm_content=Splunk_Enterprise_Demo&_bt=71949381564285&msclkid=6bcd6643d7301227edc33aaf1a6c0c63)
- [Install Node.js](https://nodejs.org/)
- [Install npm](https://www.npmjs.com/get-npm)
- [Install Bash](https://www.wpxbox.com/how-to-enable-install-bash-windows-10/) (for Mac OS/Linux/Unix)
- [Install Git Bash](https://git-scm.com/download/win) (for Windows, then open Git bash as administrator)

#### Install App
- Clone this folder
```
$ git clone https://github.com/haohanz/SafeMed.git
```
- Inside SafeMed's root folder, run
```
$ sh ./build.sh
```
- Then input your Splunk username and Splunk password as instructed. 
- If Splunk Demon is not running, need to input username and password again to start Splunk Demon and Splunk Web.

#### Launch SafeMed App
- On the [refresh page](http://localhost:8000/en-GB/debug/refresh), click "refresh". (Chrome also requires clearing cache)
- Open browser, launch [SafeMed](http://localhost:8000/app/safemed/)
- If safemed app's update is not shown, restart Splunk.

#### Indexes & Datasets
- Index "nexpose": nexpose logs
    * Prior to upload, if you have CVE-ID data, rename its field name to "cve"; otherwise, create an empty field named "cve"
- Index "hospital_data": hospital device information
- Index "cve": cve info and cwe mapping relations
    * Prior to upload, if you have CVE-ID data, rename its field name to "cve"; otherwise, create an empty field named "cve"
    * Prior to upload, if you have CWE-ID data, rename its field name to "cwe"; otherwise, create an empty field named "cwe"
- Index "cwe": cwe dataset
    * Prior to upload, if you have CWE-ID data, rename its field name to "cwe"; otherwise, create an empty field named "cwe"
    
## Functionality

#### See aggregated results for device and vulnerability
- The Aggregate Page would show all of the manufacturer's (sorted), click on "-" to hide all the models of the manufacturer
- Each model is followed by vulnerability name and CWE ID.
![Aggregate Page Layout](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_aggregate_0.png)
- Click on the button of Manufacturers would redirect page to default search, which can show the aggregated results on the clicked manufacturer, each record include both hospital info + nexpose record + cve info + cwe info.
![Aggregated Make](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_make.png)
- Also, click on the cell of Model can lead to aggregated search page on Make & Model
![Aggregated Make and Model](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_aggregate_make_and_model.png)
- Click on vulnerability name on aggregate view can see detailed page for clicked vulnerability, filtered by make & model
![Detailed Page](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_detail.png)

#### Search by vulnerability name / CVE ID / CWE ID
- In the search page, input keyword and select input type
    * CVE ID
    * CWE ID / Vulnerability keyword
![CVE/CWE Search](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_search.png)
- See aggregated results for Vulnerability keyword:
![Vul Search](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_search_vul.png)
- See aggregated results for CVE ID:
    * CVE Details
    * Aggregated search results
![CVE Search](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_search_cve.png)
- See aggregated results for CWE ID:
![CWE Search](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_search_cwe.png)


#### File upload / Create index
- Upload through GUI
    - Create index by input index name and click "create"
    - Upload file by select index name and select file, then click "upload"
    ![Click on "Upload"](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_upload.png)

- Upload via CLI
    - In $SPLUNK_HOME/bin folder
    ```
    $ ./splunk add index <INDEX_NAME>
    $ ./splunk add [monitor/oneshot] <FILE_PATH> -index <INDEX_NAME>
    ```

#### Visualization dashboard
- View aggregated results for make and model
- View top 10 records for make and model
- View latest records for some type of device
- View statistical result for make & model numbers
!["Visualization1"](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_visualization_1.png)
!["Visualization2"](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.4_visualization_2.png)


#### Search on Nexpose & Hospital Data
- Search on [Nexpose Page](http://localhost:8000/app/safemed/nexpose)
- Click on ip's value
![Nexpose, click on ip](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.2_nexpose.png)
- Redirect to [Hospital Page](http://localhost:8000/app/safemed/hospital), with url containing the clicked value in "ip" parameter.
- View correlated hospital data
![Correlated hospital data](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.2_hospital.png)
- Click on different fields of the table
![Click on hospital data method2](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.2_hospital_click1.png)
- Or, click on detailed field
![Click on hospital data method1](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.2_hospital_click2.png)
- Show filtered correlated results (from two data sources) on the same page
![Correlated results with clicked value](https://github.com/haohanz/SafeMed/blob/master/artifact/images/v1.2_correlate.png)


## Contributors
- Haohan Zhang (haohanz@andrew.cmu.edu)
- Yucheng Wang (yucheng4@andrew.cmu.edu)
- Shuo Li (shuoli2@andrew.cmu.edu)
- ChenLin Xu (cxu2@andrew.cmu.edu)

## Mentor
- Hasan Yasar (hyasar@andrew.cmu.edu)
