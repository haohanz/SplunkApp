/*
  Notes:
  1. The "Most Recent N Events for Model Panel" displays the most recent N events for a historical search,
     or the first N captured events for a real-time search
  2. By default, N = 10; You can this value by modifying the variable NUM_EVENT_VIS_PANEL in global.js
  3. The default panel title is "Most Recent 10 Events for Model"; You can always change it in visualization.xml
*/

require([
		"splunkjs/mvc",
		"splunkjs/mvc/searchmanager",
		"splunkjs/mvc/eventsviewerview",
		"jquery",
		"/static/app/safemed/js/global.js",
		"splunkjs/mvc/simplexml/ready!"
], function(
		mvc,
		SearchManager,
		EventsViewer,
		$
	){

	var modelSelector = document.getElementById("modelSelector");
	var selected_model = "";
	// Obtain unique model names
	var searchModelNames = new SearchManager({
		preview: true,
		cache: true,
		status_buckets: 300,
		rf: "*",
		search: `index="${HOSPITAL_IDX}" | fields "${HOSPITAL_MODEL}" | dedup "${HOSPITAL_MODEL}"`
	});

	// Search for latest N events for selected model
	var searchEvents = new SearchManager({
		id: "searchEvents",
		preview: true,
		cache: true,
		status_buckets: 300,
		rf: "*",
		search: "place holder"
	});

	eventsTable = new EventsViewer({
		managerid: "searchEvents",
		count: 5, // The number of events to display per page
		maxLines: 5, // The maximum number of lines to display for each event
		rowNumbers: false, // Whether to display row numbers
		"table.drilldown": true,
		"table.wrap": true,
		el: $("#eventsViewer")
	}).render();

	eventsTable.on("click", function(e) {
		e.preventDefault();
		window.open(`search?q=search index="${HOSPITAL_IDX}" "${selected_model}" "${e.data["click.value"]}"&earliest=0&latest=now`, "_blank");
	});

	function updateSearchModel() {
		searchEvents.settings.unset("search");
		searchEvents.settings.set("search", `index="${HOSPITAL_IDX}" ${selected_model} | head ${NUM_EVENT_VIS_PANEL}`);
	}

	var myResults = searchModelNames.data("results");
	var firstModelFlag = true;
	var modelOptions = "<option>Select Model</option>";

	myResults.on("data", function() {
		// Indicates whether the results model has data
		var dataSet = myResults.data().rows;
		$.each(dataSet, function(index, val) {
			if (firstModelFlag) {
				selected_model = val[0];
				updateSearchModel();
				firstModelFlag = false;
			}
			modelOptions += "<option>" + val[0] + "</option>";
		});

		modelSelector.innerHTML = modelOptions;
	});
	// A click event handler for the Submit button
	$("#applyModelButton").on("click", function(e) {
		// Prevent drilldown from redirecting away from the page
		e.preventDefault();
		selected_model = modelSelector.value;
		if (selected_model === "Select Model") alert("Please select a valid model!");
		else {
			updateSearchModel();
		}
	});
});
