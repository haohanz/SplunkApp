const HOST = '74.109.247.7';

var globals = {
    nodeUrl: `http://${HOST}:4000`,
    url: `http://${HOST}:8000`,
    hospital_idx: "hospital_data",
    nexpose_idx: "nexpose",
    cve_idx: "cve",
    cwe_idx: "cwe",
    internal_idx: "_internal",
    audit_idx: "_audit",
    history_idx: "history",
    subpath: "/vuln/detail/",
    options: {
            hostname: "nvd.nist.gov",
            path: ""
    },
    searchParams: {
        exec_mode: "normal",
        output_mode: "json",
        sort_key: "_time",
        earliest_time: "2012-06-20T16:27:43.000-07:00"
    },
    SET: new Set(["vuln_description",
                 "vuln_cvssv3_base_score",
                 "vuln_cvssv3_base_score_severity",
                 "vuln_cvssv3_impact_score",
                 "vuln_cvssv3_exploitability_score",
                 "vuln_cvssv3_av",
                 "vuln_cvssv3_ac",
                 "vuln_cvssv3_pr",
                 "vuln_cvssv3_ui",
                 "vuln_cvssv3_s",
                 "vuln_cvssv3_c",
                 "vuln_cvssv3_i",
                 "vuln_cvssv3_a",
                 "vuln_technical_details_0_link",
                 "vuln_cvssv2_base_score",
                 "vuln_cvssv2_base_score_severity",
                 "vuln_cvssv2_impact_subscore",
                 "vuln_cvssv2_exploitability_score",
                 "vuln_cvssv2_additional"]),
    ATTR_ID: "data-testid",
    NEXPOSE: "nexpose",
    ADDITIONAL: "vuln_cvssv2_additional"
};

module.exports = globals;
module.exports.HOST = HOST;

