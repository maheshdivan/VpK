/*
Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*

*/

// Global vars 
var version = 'Get from server';

var socket = io.connect();

var dix;
var dixArray = [];
var svgE = 0;
var baseDir;
var validDir;
var newDir;
var colors;

var files;

//var vpkHost = 'http://127.0.0.1:4200'
//----------------------------------------------------------
// document ready
//----------------------------------------------------------
$(document).ready(function() {

    getVersion();

    $("#searchBtn").click(function(e) {
        e.preventDefault();
        searchObj();
    });

    $("#validateBtn").click(function(e) {
        e.preventDefault();
        reload();
    });

    $("#fileDirBtn").click(function(e) {
        e.preventDefault();
        uploadDir();
    });

    $('[data-toggle="popover"]').popover();

    $('[data-toggle="tooltip"]').tooltip();

    $(function() {
        Dropzone.options.fileUploadDropzone = {
            maxFilesize: 1,
            maxFiles: 500,
            addRemoveLinks: true,
            dictResponseError: 'Server not Configured',
            url: '/upload',
            uploadMultiple: true,
            parallelUploads: 5,
            addRemoveLinks: true,
            dictRemoveFile: 'Delete',
            init: function() {

                var cd;
                this.on("success", function(file, response) {
                    $('.dz-progress').hide();
                    $('.dz-size').hide();
                    $('.dz-error-mark').hide();
                    console.log(response);
                    console.log(file);
                    cd = response;
                });
                this.on("addedfile", function(file) {
                    var removeButton = Dropzone.createElement("<a href=\"#\">Remove file</a>");
                    var _this = this;
                    removeButton.addEventListener("click", function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _this.removeFile(file);
                        var name = "largeFileName=" + cd.pi.largePicPath + "&smallFileName=" + cd.pi.smallPicPath;
                        $.ajax({
                            type: 'POST',
                            url: 'DeleteImage',
                            data: name,
                            dataType: 'json'
                        });
                    });
                    file.previewElement.appendChild(removeButton);
                });
            }
        };
    })

    clearDisplay();
    getSelectLists();
    getColors();

});


//----------------------------------------------------------
// socket io definitions for incoming 
//----------------------------------------------------------
socket.on('colorsResult', function(data) {
    colors = data;
    //console.log(JSON.stringify,null,2);
});

socket.on('connect', function(data) {
    socket.emit('join', 'Session connected');
});

socket.on('dirStatsResult', function(data) {
    buildDirStats(data);
});

socket.on('dynamicResults', function(data) {
    //console.log('dynamicResults: ' + JSON.stringify(data, null, 4));
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');
    var resp = '';
    if (data.status === 'PASS') {
        resp = '<br><div><img style="float: left;" src="images/checkMarkGreen.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Cluster processed.</div>';
    	$("#clusterStatus").html(resp); 
    } else {
        resp = '<br><div><img style="float: left;" src="images/checkMarkRed.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;'  + data.message + '</div>';
        $("#clusterStatus").html(resp);
    	
    }   
    
});

socket.on('dynstat', function(data) {
    console.log(JSON.stringify(data, null, 4));
});

socket.on('logResult', function(data) {
    console.log(JSON.stringify(data, null, 4));
    showLogFile(data);
});

// retrieve object definition
socket.on('objectDef', function(data) {
    objectDef(data)
});


socket.on('resetResults', function(data) {
    //console.log('resetResults: ' + JSON.stringify(data, null, 4));
    $("#loadStatus").empty();
    $("#loadStatus").html('');
    var resp;
    if (data.validDir === false) {
        resp = '<br><div><img style="float: left;" src="images/checkMarkRed.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Provided directory name does not exist.  Please provide a valid directory to continue.</div>';
        $("#loadStatus").html(resp);
        setBaseDir('Invalid directory: ' + newDir);
    } else {
        resp = '<br><div><img style="float: left;" src="images/checkMarkGreen.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Directory parsed and loaded.</div>';
        $("#loadStatus").html(resp);
        setBaseDir(data.baseDir);
    }
    clearDisplay();
});

socket.on('svgResult', function(data) {
    svgResult(data);
});

socket.on('selectListsResult', function(data) {
    populateSelectLists(data);
});

socket.on('searchResult', function(data) {
    buildSearchResults(data);
});

socket.on('svgResult', function(data) {
    svgResult(data);
});

socket.on('uploadDirResult', function(data) {
    console.log(JSON.stringify(data, null, 4));
    $("#uploadStatus").empty();
    $("#uploadStatus").html('');
    $("#uploadStatus").html(data.msg);

    if (data.status === 'PASS') {
        $("#uploadDir").val(data.dir);
        $("div#filedropzone").show();
    }
});

socket.on('version', function(data) {
    version = data.version;
});


//----------------------------------------------------------
// socket io definitions for out-bound
//----------------------------------------------------------

// loop and check for rows with checkbox checked and get SVG data
function check() {
    var selected = [];
    if (dix > -1) {
        for (var c = 0; c <= dix; c++) {
            if ($('#cbox' + c).is(":checked")) {
                selected.push(dixArray[c]);
            }
        }
        if (selected.length > 0) {
            socket.emit('getSvg', selected);
        }
    }
}

// request to clear directory stats
function clearStats() {
    $("#statsData").empty();
    $("#statsData").html('');
}

// send request to server to get colors
function getColors() {
    socket.emit('getColors');
}

// send request to server to get object definition
function getDef(def) {
    socket.emit('getDef', def);
}

// send request to server to get directory stats
function getDirStats() {
    socket.emit('getDirStats');
}

// send request to server to get drop down list data
function getSelectLists() {
    socket.emit('getSelectLists');
}

// send request to server to get software version
function getVersion() {
    socket.emit('getVersion');
}

// send request to server to get SVG data for ojbect
function getSvg(obj) {
    var gArray = [];
    gArray.push(obj);
    socket.emit('getSvg', gArray);
}

// send request to load new directory
function reload() {
    var newDir = $("#newDir").val();
    socket.emit('reload', newDir);
    $("#loadStatus").empty();
    $("#loadStatus").html('');
    $("#loadStatus").html('<br><p>Processing request to set directory.</p>');
}

// send request to server to search for data
function searchObj() {
    var namespaceFilter = $("#namespaceFilter option:selected").text();
    var searchType = $("#searchType option:selected").text();
    var searchValue = $("#searchKeys").val();
    var data = {
        "searchValue": searchValue,
        "namespaceFilter": namespaceFilter,
        "searchType": searchType
    }
    socket.emit('search', data);
}


//----------------------------------------------------------
// navigation functions
//----------------------------------------------------------

function openNav() {
    document.getElementById("sideNavigation").style.width = "250px";
}

function closeNav() {
    document.getElementById("sideNavigation").style.width = "0";
}

// get logs from server
function viewLog() {
    closeNav();
    socket.emit('getLog');
}

// show color palette
function viewPalette() {
    closeNav();
    buildColorTable();
    $("#colorModal").modal();
}

// clear logs on server
function clearLog() {
    closeNav();
    socket.emit('clearLog');
}

// show change directory modal 
function changeDir() {
    closeNav();
    $("#chgDirModal").modal();
}

// show file upload modal 
function fileUpload() {
    $("div#filedropzone").hide();
    closeNav();
    $("#fileModal").modal();
}

// show change directory modal 
function uploadDir() {
    var upDir = $("#uploadDir").val();
    socket.emit('uploadDir', upDir);
}

// show server parse statistics
function dirStats() {
    closeNav();
    socket.emit('getDirStats');
}

// get Cluster information 
function getCluster() {
    closeNav();
    
    // screen defaults
	$("#clusterUser").val('admin');
    $("#clusterIP").val('192.168.0.1');
    $("#clusterPassword").val('');
    $("#clusterName").val('mycluster.icp');
    $("#clusterPort").val('8443');
	$("#clusterNamespace").val('all-namespaces');
    
    $("#clusterModal").modal();
}

        


// process cluster info input and pass to server 
function dynamic() {
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');

    var user = $("#clusterUser").val();
    var ip = $("#clusterIP").val();
    var pswd = $("#clusterPassword").val();
    var name = $("#clusterName").val();
    var port = $("#clusterPort").val();
	var kurl = 'https://' + ip + ':8001';
	var url  = 'https://' + ip + ':' + port
	var ns   = $("#clusterNamespace").val();

    var icp = {
        "username": user,
        "pswd" : pswd,
        "url"     : url,
        "clustername": name,
        "kubeurl" : kurl,
        "ns": ns,
        "ip": ip
	}
	        
    $("#clusterStatus").empty();
    var resp = '<br><div><img style="float: left; vertical-align: middle; margin-bottom: 0.75em;" src="images/loading.gif" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;">Processing, can take several seconds to complete</span></div>';
    $("#clusterStatus").html(resp);

    socket.emit('dynamic', icp);
}


//----------------------------------------------------------
// common functions
//----------------------------------------------------------
// populate drop down selections with server provided data
//----------------------------------------------------------

function buildColorTable() {
	var html = '<table>';
	var p1 = '<td width="120px" height="60px" style="background-color:#';
	var p2 = '; border: 4px solid white; color: #';
	var p3 = '; font-family: sans-serif; font-size: 11px; ">&nbsp;';
	var p4 = '</td>';
	var row = 1;
	var item = '';
	var data = colors.colors
	var bg,tc, tx
	for (c in data) {
		//console.log(JSON.stringify(c,null,2))
		if (row === 1) {
			html = html + '<tr>';
		}
		bg = data[c][0].backgroundColor;
		tc = data[c][0].textColor;
		tx = data[c][0].title;
		
		item = p1 + bg + p2 + tc + p3 + c  + '<br>&nbsp' + bg + '<br>&nbsp';
		if (tx !== "") {
			item = item + tx + p4;
		} else {
			item = item + p4;
		}
		html = html + item;
		console.log(item);
		item = '';
		row++
		if (row === 6) {
			html = html + '</tr>';
			row = 1;
		}
	}
	if (row !== 1) {
		html = html + '</tr></table>';
	} else {
		html = html + '</table>';
	}
	$("#colorContents").empty();
    $("#colorContents").html(html);
    
}


function populateSelectLists(data) {
    var options;

    $("#searchType").empty();
    $("#searchType").html('');
    $("#namespaceFilter").empty();
    $("#namespaceFilter").html('');

    if (data.validDir === false) {
        setBaseDir('Invalid directory: ' + data.baseDir);
    } else {
        setBaseDir(data.baseDir);
        options = bldOptions(data.kinds, 'K');
        $("#searchType").html(options);
        options = bldOptions(data.namespaces, 'N');
        $("#namespaceFilter").html(options);
    }

}

function buildDirStats(stats) {
    console.log
    var item;
    var tmp;
    var parts;
    var htm;
    htm = '<table data-toggle="table" data-click-to-select="true"><thead><tr>' +
        '<th data-field="namespace">Kind / Type</th><th data-field="kind">Count</th>' +
        '</tr></thead><tbody>';

    var newPart;
    for (var i = 0; i < stats.length; i++) {
        tmp = stats[i];
        parts = tmp.split('::');

        // add source file name to the button
        newPart = '<tr>' +
            '<td width="300">' + parts[0] + '</td><td>' + parts[1] + '</td>'
        htm = htm + newPart
    };

    htm = htm + '</tbody></table>';

    $("#statContents").empty();
    $("#statContents").html('');
    $("#statContents").html(htm);
    $("#statsModal").modal();

}


function about() {
    $("#version").empty();
    $("#version").html('');
    $("#version").html('VERSION <span style="color: blue;">' + version + '</span>');
    $("#aboutModal").modal();
}


function clearDisplay() {
    $("#svgResults").empty();
    $("#svgResults").html('');

    $("#searchData").empty();
    $("#searchData").html('');

    $("#statsData").empty();
    $("#statsData").html('');
}


function setBaseDir(dir) {
    var htm;
    htm = '<input type="text" class="form-control" placeholder="' + dir + '"  disabled="true">';

    $("#baseDir").empty();
    $("#baseDir").html('');
    $("#baseDir").html(htm);
}


//----------------------------------------------------------
// sort and build the selection list option entries
//----------------------------------------------------------
function bldOptions(options, type) {
    var items = [];
    var listitems = '';

    for (option in options) {
        items.push(option)
    };
    items.sort();
    for (var i = 0; i < items.length; i++) {
        if (i === 0 && type === 'K') {
            listitems = '<option>all-kinds</option>'
        }
        listitems += '<option>' + items[i] + '</option>';
    }
    return listitems;
}


//----------------------------------------------------------
// build the search results table
//----------------------------------------------------------
function buildSearchResults(data) {
    var part2 = '';
    var newPart;
    var tmp;
    var a, b, c, d;
    dix = -1;
    dixArray = [];
    for (item in data) {
        tmp = data[item]
        a = tmp.namespace;
        b = tmp.kind;
        c = tmp.name;
        d = tmp.src;
        e = tmp.part;
        dix++;

        // add source file name to the button
        newPart = '<tr data-index="' + dix + '">' +
            '<td class="bs-checkbox">' +
            '<input data-val="' + dix + '" name="cbox' + dix + '" type="checkbox" id="cbox' + dix + '"></td>' +
            '<td>' + a + '</td><td>' + b + '</td><td>' + c + '</td>' +
            '<td><button id="viewSvg" class="btn btn-outline-primary btn-sm" onclick="getSvg(\'' + a + '::' + b + '::' + c + '::' + d + '::' + e + '\')">View</button></td></tr>'
        part2 = part2 + newPart;

        dixArray.push(a + '::' + b + '::' + c + '::' + d + '::' + e);
    };

    $("#searchData").empty();
    $("#searchData").html('');
    $("#searchData").html(part2);

}

//----------------------------------------------------------
console.log('loaded vpkmain.js');