var indexSelector = document.getElementById("indexSelector");
var indexInput = document.getElementById("indexInput");
var fileInput = document.getElementById("fileInput");
var createButton = document.getElementById("createButton");
var uploadButton = document.getElementById("uploadButton");
var fileName = document.getElementById("fileName");

function updateIndex() {
    console.log(1);
    $.post(
        "http://localhost:4000/get_indexes",
        JSON.stringify({}),
        function(data) {
            var idxArr = JSON.parse(data);
            var options = "";
            for (var i = 0; i < idxArr.length; i++) {
                console.log(idxArr[i]);
                options += "<option>" + idxArr[i] + "</option>";
            }
            if (idxArr.length > 0) {
                indexSelector.innerHTML = options;
            }
        }
        );
}

updateIndex();

createButton.onclick = function() {
    console.log(indexInput.value);
    if (!indexInput.value) {
        alert("Index cannot be empty!");
        return;
    }
    $.post(
        "http://localhost:4000/add_index",
        JSON.stringify({idx: indexInput.value})
        );
    updateIndex();
    alert(`Index ${indexInput.value} created!`);
    location.reload();
};

var lines = [];

uploadButton.onclick = function() {
    var index = indexSelector.options[indexSelector.selectedIndex].value;
    if (!lines || !lines.length) {
        alert("Empty file!");
        return;
    }
    var fields = lines[0];
    var nums = lines.length;
    var lineIdx = 1;

    var intervalObject = setInterval(function () {
        if (lineIdx >= nums) {
            console.log('Finished upload.');
            alert("File uploaded!");
            clearInterval(intervalObject);
            return;
        }
        var currLines = lines.slice(lineIdx, lineIdx + 50);
        lineIdx += 50;

        $.post(
                "http://localhost:4000/add_file",
                JSON.stringify({ evts: currLines, fields: fields, idx: index }),
                function(res) {
                    if (res.message.startsWith("Invalid")) {
                        alert(res.message);
                        clearInterval(intervalObject);
                        return;
                    } else {
                        console.log(res, lineIdx);
                    }
                    // location.reload();
                });
    }, 200); //TODO: performance test

};

fileInput.onchange = function(e) {
    var file = e.target.files[0];
    fileName.setAttribute("value", file.name);
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
        lines = String(evt.target.result).split("\n");
    }
};

