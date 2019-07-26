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
    var ip = new URL(window.location).searchParams.get(IP) || "";
    var manu = new URL(window.location).searchParams.get(MANU);
    var search_text;
    if (manu) {
        search_text = `index="${HOSPITAL_IDX}" "${manu}" ` +
            `| rename "${HOSPITAL_IP_1}" as ${EXTRACT_HOST} ` +
            `| join ${EXTRACT_HOST} type=inner ` +
            `[` +
            `search index="${NEXPOSE_IDX}" ` +
            `| rename ${NEXPOSE_HOST} as ${EXTRACT_HOST}` +
            `]`;
    } else {
        search_text = `index="${HOSPITAL_IDX}" ${ip}`;
    }

    // Create the customized search manager with key value
    var mysearch = new SearchManager({
        id: "search1",
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: search_text
    });

    // Create the views
    var mytimeline = new TimelineView ({
        id: "timeline1",
        managerid: "search1",
        el: $("#mytimeline1")
    }).render();

    var mysearchbar = new SearchbarView ({
        id: "searchbar1",
        managerid: "search1",
        el: $("#mysearchbar1")
    }).render();

    var mysearchcontrols = new SearchControlsView ({
        id: "searchcontrols1",
        managerid: "search1",
        el: $("#mysearchcontrols1")
    }).render();

    // When the timeline changes, update the search manager
    mytimeline.on("change", function() {
        mysearch.settings.set(mytimeline.val());
    });

    // When the query in the searchbar changes, update the search manager
    mysearchbar.on("change", function() {
        mysearch.settings.unset("search");
        mysearch.settings.set("search", mysearchbar.val());
    });

    // When the timerange in the searchbar changes, update the search manager
    mysearchbar.timerange.on("change", function() {
        mysearch.settings.set(mysearchbar.timerange.val());
    });

    var tableviewer = new EventsViewer({
        id: "example-eventsviewer",
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

    tableviewer.on("click", function(e) {
        e.preventDefault();
        console.log(e.data);
        var name = e.data[CLICK_NAME];
        var value = e.data[CLICK_VALUE];
        var search_test = `index="${HOSPITAL_IDX}" "${value}" ${RENAME}`;
        console.log(search_test);
        var url = new URL(window.location);
        mysearch.settings.unset("search");
        mysearch.query.set("search", search_test);
        mysearchbar.val(search_test);
    });

    $("#return").on("click", function(e) {
        var url = new URL(window.location).href;
        var idx = url.lastIndexOf('/');
        var rtnPage = url.substr(0, idx) + `/${NEXPOSE_PAGE}`;
        console.log(rtnPage);
        window.location.href = rtnPage;
    });

    $("#refresh").on("click", function(e) {
        location.reload();
    });

});

