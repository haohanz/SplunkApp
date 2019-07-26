// nexpose log index
var NEXPOSE_IDX="nexpose";
// hospital data index
var HOSPITAL_IDX="hospital_data";
// hospital ip 1 field name
var HOSPITAL_IP_1="IP Address 1";
// hospital ip 2 field name
var HOSPITAL_IP_2="IP Address 2";
// raw data field name
var RAW="_raw";
// eventsviewerview/tableview click field name
var CLICK_NAME="click.name2";
// eventsviewerview/tableview click value
var CLICK_VALUE="click.value2";
// joint table host field name
var EXTRACT_HOST="HOST";
// nexpose log data host field name
var NEXPOSE_HOST="extracted_Host";
// splunk default host field name
var HOST="host";
// redirect uri param name
var IP="ip";
// redirect uri param name
var MANU="manu";
// redirected hospital search page name
var HOSPITAL_PAGE="hospital";
// nexpose search page name
var NEXPOSE_PAGE="nexpose";
// search for aggregated result, inner join nexpose
var RENAME=`| rename "${HOSPITAL_IP_1}" as ${EXTRACT_HOST} ` +
`| join ${EXTRACT_HOST} type=inner ` +
`[` +
`search index="${NEXPOSE_IDX}" ` +
`| rename ${NEXPOSE_HOST} as ${EXTRACT_HOST}` +
`]`;
// search for aggregated result, inner join hospital
var RENAME2=`| rename "${NEXPOSE_HOST}" as ${EXTRACT_HOST}` +
`| join ${EXTRACT_HOST} type=inner ` +
`[` +
`search index="${HOSPITAL_IDX}" ` +
`| rename "${HOSPITAL_IP_1}" as ${EXTRACT_HOST} ` +
`]`;
// CVE redirect search name
var CVE="cve";
// CWE redirect search name
var CWE="cwe";
// Make redirect search name
var MAKE="make";
// Model redirect search name
var MODEL="model";
// hospital model make name
var HOSPITAL_MAKE="Manufacturer";
// hospital model field name
var HOSPITAL_MODEL="Model";
// minimum hospital fields TODO
var HOSPITAL_FIELDS=`"EQ Class", "Model Number", "Department", "${HOSPITAL_IP_1}", "${HOSPITAL_IP_2}" | fields - _raw - _time`;
// nexpose search fields
var NEXPOSE_FIELDS=`"${EXTRACT_HOST}" "${CVE}" | fields - _raw - _time`;
// cve cwe name field
var CWE_NAME="vuln_technical_details_0_link";
// number of events to display in the "Most Recent N Events for Model" panel on visualization page
var NUM_EVENT_VIS_PANEL=10;
