require([
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/timelineview",
    "splunkjs/mvc/eventsviewerview",
    "/static/app/safemed/js/global.js",
    "splunkjs/mvc/simplexml/ready!",
], function(
    SearchManager,
    SearchbarView,
    SearchControlsView,
    TimelineView,
    EventsViewer
) {


    // Get key of search
    var ip = new URL(window.location).searchParams.get(IP) || "";

    // Create the search manager
    var mysearch = new SearchManager({
        id: "search1",
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: `index=${NEXPOSE_IDX} ${ip}| head 100`
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

    tableviewer = new EventsViewer({
        id: "example-eventsviewer",
        managerid: "search1",
        type: "list",
        "table.drilldown": true,
        drilldownRedirect: false,
        "table.sortColumn": "sourcetype",
        "table.sortDirection": "asc",
        "table.wrap": true,
        count: 5,
        pagerPosition: "top",
        rowNumbers: false,
        el: $("#myeventsviewer")
    }).render();

    // A click event handler
    tableviewer.on("click", function(e) {
        e.preventDefault();
        var name = e.data[CLICK_NAME];
        console.log(e.data, name);
        if (name == NEXPOSE_HOST || name == RAW || name == HOST) {
            var ip = e.data[CLICK_VALUE];
            var url = new URL(window.location).href;
            var idx = url.lastIndexOf('/');
            var newUrl = url.substr(0, idx) + `/${HOSPITAL_PAGE}?${IP}=${ip}`;
            console.log(newUrl);
            window.location.href = newUrl;
        }
    });
});

