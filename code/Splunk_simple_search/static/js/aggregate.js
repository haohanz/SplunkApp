require([
        "splunkjs/mvc/searchmanager",
        "/static/app/safemed/js/global.js",
        "/static/app/safemed/js/make.js",
        "/static/app/safemed/js/model.js",
        "splunkjs/mvc/simplexml/ready!",
], function(SearchManager) {

    var searchParams = new URL(window.location).searchParams;
    var type = searchParams.get("type");
    var keyword = searchParams.get("keyword");

    var cve;
    var cve_keyword = '';
    var cwe_keyword = '';
    var join = 'outer';

    if (type && keyword) {
        $("#title").get(0).innerHTML += ", keyword: " + keyword;
        join = 'inner';
        keyword = keyword.replace(/\+/g, ' ').trim();
        if (type === "cve") cve = keyword;
        keyword = '"' + keyword.split(" ").join('" "') + '"';
        if (type === "cve") {
            cve_keyword = keyword;
            $.post("http://localhost:4000/cve_search",
                    JSON.stringify({ cve: cve }),
                    function(data) {
                        var str = `<h2><strong>Detail for CVE: ${cve}</strong></h2>`;
                        for (var key in data) {
                            str += `<strong>${key}<\/strong>: ` + data[key].trim().replace(/(\n)+/g, '<br/>') + "<br/>";
                        }
                        str += `<a href="https://nvd.nist.gov/vuln/detail/${cve}">NVD Link to ${cve}</a><br/>`;
                        str += `<a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}">Mitre Link to ${cve}</a><br/>`;
                        $("div.cve").html(str);
                    }
                  );
        } else if (type === "cwe") {
            cwe_keyword = keyword;
        }
    }

    var query = `index="${HOSPITAL_IDX}"
        | rename "${HOSPITAL_IP_1}" as HOST
        | join HOST type=inner
        [search index="${NEXPOSE_IDX}" | rename "${NEXPOSE_HOST}" as HOST]
        | join cve type=${join} [search index=cve ${cve_keyword}]
            | join cwe type=${join} [search index=cwe cwe=* ${cwe_keyword}]`;

    var searchContent = {
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: `${query} | fields "${HOSPITAL_MAKE}", "${HOSPITAL_MODEL}", "cwe", "${CWE_NAME}"`
    };

    console.log(searchContent.search);
    // Create the search manager
    var searchMake = new SearchManager(searchContent);
    // TODO: maxresult = 1000
    var myResults = searchMake.data("results", {count: 0});

    var makes = {};

    myResults.on("data", function() {
        // Indicates whether the results model has data
        var dataSet = myResults.data().rows;
        console.log(dataSet.length);
        $("div.report").get(0).innerHTML = '';

        $.each(dataSet, function (index, val) {
            var subMake = val[0];
            var subModel = val[1];
            var subCwe = val[2];
            var subVulName = val[3];
            if (!makes[subMake]) {
                makes[subMake] = new Make(subMake);
            }
            var makeObj = makes[subMake];
            if (!makeObj.models[subModel]) {
                makeObj.models[subModel] = new Model(subModel);
            }
            var modelObj = makeObj.models[subModel];
            modelObj.cwes[subCwe] = subVulName;
        });

        var make;
        for (make in makes) {
            var makeObj = makes[make];
            // make div
            var makeDiv = document.createElement("div");
            makeDiv.className = "make";
            var imgsDiv = document.createElement("div");
            imgsDiv.className = "imgs";
            var img = document.createElement("img");
            img.setAttribute("class", "dropdown");
            img.setAttribute("src", "/static/app/safemed/images/minus.png");
            img.id = make;
            imgsDiv.appendChild(img);

            var infosDiv = document.createElement("div");
            infosDiv.className = "infos";
            var infosElmt = document.createElement("a");

            var url = new URL(window.location).href;
            var idx = url.lastIndexOf('/');
            var searchURL = url.substr(0, idx) + "/search?q=";
            var detailURL = url.substr(0, idx) + "/detail?";

            // aggregate nexpose+hospital+cve, filtered by make
            var searchText = `${searchURL}"${make}" ${query}&earliest=0`.replace("'", "%27");
            infosElmt.setAttribute("href", searchText);
            infosElmt.innerHTML = make;
            infosDiv.appendChild(infosElmt);

            var modelDiv = document.createElement("div");
            modelDiv.className = "model";
            modelDiv.setAttribute("style", "display: block");
            modelDiv.id = make;

            for (var model in makeObj.models) {
                var modelObj = makeObj.models[model];
                var table = document.createElement("table");
                // aggregate nexpose+hospital+cve, filtered by make&model
                searchText = `${searchURL}"${make}" "${model}" ${query}&earliest=0`.replace("'", "%27");
                var tableHTML = `<tr>
                    <td><a href='${searchText}'>${model}</a></td>`;
                for (var cwe in modelObj.cwes) {
                    if (cwe && modelObj.cwes[cwe]) {
                        var detailHref = `${detailURL}make=${make}&model=${model}&cwe=${cwe}`.replace("'", "%27");
                        tableHTML += `<td><a href='${detailHref}'>${modelObj.cwes[cwe]} (${cwe})</a></td>`;
                    }
                }
                tableHTML += `</tr>`;
                table.innerHTML = tableHTML;
                modelDiv.appendChild(table);
            }

            makeDiv.appendChild(imgsDiv);
            makeDiv.appendChild(infosDiv);
            makeDiv.appendChild(modelDiv);

            img.addEventListener("click", function () {
                var modelDiv = $(`div#${this.id}.model`)[0];
                if (this.src.endsWith("minus.png")) {
                    this.src = "/static/app/safemed/images/plus.png";
                    modelDiv.style.display = "none";
                    modelDiv.setAttribute("style", "display: none");
                    return;
                } else {
                    this.src = "/static/app/safemed/images/minus.png";
                    modelDiv.style.display = "block";
                    modelDiv.setAttribute("style", "display: block");
                }
            });

            $("div.report")[0].appendChild(makeDiv);
        }
    });
});

