require([
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/searchbarview",
        "splunkjs/mvc/searchcontrolsview",
        "splunkjs/mvc/timelineview",
        //"splunkjs/mvc/tableview",
        "splunkjs/mvc/eventsviewerview",
        "/static/app/safemed/js/global.js",
        "splunkjs/mvc/simplexml/ready!"
], function(
    SearchManager,
    SearchbarView,
    SearchControlsView,
    TimelineView,
    EventsViewer
    ) {
    // Get key of search
    var params = new URL(window.location).searchParams;
    var ip = params.get(IP) || "";
    var cwe = params.get(CWE);
    var make = params.get(MAKE);
    var model = params.get(MODEL);

    // Search CWE detail
    var cweSearchText = `index=cwe cwe="${cwe}" | fields - _*`;

    var searchParam = {
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: cweSearchText
    }

    // Create the customized search manager for hospital records
    var cweSearch = new SearchManager(searchParam);
    var cweResults = cweSearch.data("results");

    cweResults.on("data", function() {
        var data = cweResults.data().rows[0];
        var fields = cweResults.data().fields;
        console.log(fields);
        var str = `<h2><strong>Detail for CWE: ${cwe}</strong></h2>`;
        for (var i = 0; i < fields.length - 10; i++){
            if (fields[i] && data[i]) {
                str += `<strong>${fields[i]}<\/strong>: ` + data[i].trim().replace(/(\n)+/g, '<br/>') + "<br/>";
            }
        }
        str += `<a href="http://cwe.mitre.org/data/definitions/${cwe.split('-')[1]}.html">Link to Mitre (${cwe}) </a><br/>`;
        $("div.cwe").html(str);
    });

    //var searchText = `index="${HOSPITAL_IDX}" "${make}" "${model}" | fields ${HOSPITAL_FIELDS}`;

    var searchText = `"${make}" "${model}" index="${HOSPITAL_IDX}"
        | rename "${HOSPITAL_IP_1}" as HOST
        | join HOST type=inner
        [search index="${NEXPOSE_IDX}" | rename "${NEXPOSE_HOST}" as HOST]
        | join cve type=inner [search index=cve cwe=* "${cwe}"]`;

    searchParam.id = "search1";
    searchParam.search = searchText;
    // Create the customized search manager for hospital records
    var mysearch = new SearchManager(searchParam);

    var tableviewer = new EventsViewer({
        id: "eventsviewer1",
        managerid: "search1",
        type: "list",
        "table.drilldown": true,
        drilldownRedirect: false,
        "table.sortColumn": "sourcetype",
        "table.sortDirection": "asc",
        "table.wrap": true,
        count: 10,
        pagerPosition: "top",
        rowNumbers: false,
        el: $("#mytable1")
    }).render();

    $("#hospital")[0].innerHTML = `<h2><strong>Details for Manufacturer ${make} and Model ${model}, filtered by cwe ${cwe}</strong></h2>`;

});

