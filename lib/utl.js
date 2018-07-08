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

/*----------------------------------------------------------

Common utility functions

*/


var vpk = require('../lib/vpk');
var Q = require('q');
var fs = require('fs');

var logIt = function(msg, component) {
        
    if (typeof component === 'undefined' || component === null) {
        component = 'notProvided';  
    }
    
//    var output = new Date().toLocaleString() + ' :: ' + component + ' :: ' + msg;
    var output = new Date().toLocaleString() + ' :: ' + msg;
    vpk.vpkLogMsg.push(output);
    // write to console
    console.log(output);
};
    


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // build the entry to for the specific item  
    //------------------------------------------------------------------------------
    bldEntry: function(evt, kind, ns, name, src, part, x, y, h, w, id) {

        var entry = {
            'evt': evt,
            'id:': id,
            'x': x,
            'y': y,
            'h': h,
            'w': w,
            'kind': kind,
            'ns': ns,
            'name': name,
            'src': src,
            'part': part
        };
        return entry;
    },


    //------------------------------------------------------------------------------
    // combine data for two arrays 
    //------------------------------------------------------------------------------
    combineData: function(data, tmp) {
        if (typeof tmp !== 'undefined') {
            if (tmp !== null && tmp.length > 0) {
                for (var e = 0; e < tmp.length; e++) {
                    data.push(tmp[e]);
                }
            }
        }
        return data;
    },
    

    //------------------------------------------------------------------------------
    // add to kind/typ counter
    //------------------------------------------------------------------------------
    countKind: function(kind) {
        if (typeof vpk.kindStats[kind] === 'undefined') {
            vpk.kindStats[kind] = 1;
        } else {
            vpk.kindStats[kind] = vpk.kindStats[kind] + 1;
        }
    },


    //------------------------------------------------------------------------------
    // check if kind/type is in array 
    //------------------------------------------------------------------------------
    checkKind: function(kind, qual) {
        // if this type of kind does not exist create one
        if (typeof qual !== 'undefined' && qual !== null) {
        	kind = kind + ' (' + qual + ')';
        }
        if (typeof vpk.kinds[kind] === 'undefined') {
            vpk.kinds[kind] = kind;
        }
    },
    

    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------
    checkDefinedNamespace: function(ns) {
        // if this namespace does not exist add it
        if (typeof vpk.definedNamespaces[ns] === 'undefined') {
            vpk.definedNamespaces[ns] = ns;
        }
    },


    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------
    logMsg: function(msg, component) {
        
        if (typeof component === 'undefined' || component === null) {
            component = 'notProvided';  
        }
    
//        var output = new Date().toLocaleString() + ' :: ' + component + ' :: ' + msg;
        var output = new Date().toLocaleString() + ' :: ' + msg;
        vpk.vpkLogMsg.push(output);
        // write to console
        console.log(output);
    },
    
    //------------------------------------------------------------------------------
    // save the yaml file contents
    //------------------------------------------------------------------------------
    saveFileContents: function(fn, part, yaml) {
        // save file content
        var key = fn + '::' + part;
        vpk.fileContent[key] = [];

        var content = {
            'sourceFile': fn,
            'part': part,
            'content': yaml
        };
        vpk.fileContentCnt++;
        vpk.fileContent[key].push(content);

    },
    
    //------------------------------------------------------------------------------
    // untar file 
    //------------------------------------------------------------------------------
    untar: function(src, dest) {
		var decompress = require('decompress');
		var decompressTargz = require('decompress-targz');
 		var fullsrc = dest + '/' + src;
 		decompress(fullsrc, dest, {
    		plugins: [
        		decompressTargz()
    		]
		})
		.then(() => {
			logIt('vpkUTL011 - Successful UnTar file: ' + fullsrc,'server');
		})
		.catch((err) => {
			logIt('vpkUTL012 - Failed to UnTar file: ' + fullsrc + ' message: ' + err,'utl');
		});
     },

    //------------------------------------------------------------------------------
    // unzip file 
    //------------------------------------------------------------------------------
    unzip: function(src, dest) {
		var decompress = require('decompress');
		var decompressUnzip = require('decompress-unzip');
 		var fullsrc = dest + '/' + src;
 		decompress(fullsrc, dest, {
    		plugins: [
        		decompressUnzip()
    		]
		})
		.then(() => {
			logIt('vpkUTL021 - Successful UnZip file: ' + fullsrc,'server');
		})
		.catch((err) => {
			logIt('vpkUTL022 - Failed to UnZip file: ' + fullsrc + ' message: ' + err,'utl');
		});
    },
    
    
    
        //------------------------------------------------------------------------------
    // read configuration file
    //------------------------------------------------------------------------------
    getColors: function() {
        var deferred = Q.defer();
        try {
            fs.readFile('./colors.json', "utf8", function(err, data) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        logIt('vpkUTL032 - Colors file: colors.json does not exist', 'utl');
                        deferred.reject('MISSING_FILE');
                    } else if (err.code === 'EACCES') {
                        logIt('vpkUTL033 - Colors file: colors.json has Permission error(s)', 'utl');
                        deferred.reject('PERMISSION_ERROR');
                    } else {
                    	logIt('vpkUTL034 - Colors file: colors.json has Unknown Error(s)', 'utl');
                    	deferred.reject('UNKNOWN_ERROR');
                    }
                } else {
                
                	// populate cldr object with config parms
                	try {
                    	vpk.colors = JSON.parse(data);
                	} catch (e) {
                    	logIt('vpkUTL035 - Colors file: colors.json has invalid format, message: ' + e, 'utl');
                    	deferred.reject('FORMAT_ERROR');
                	}
                }
                deferred.resolve(data);
            });

            return deferred.promise;

        } catch (e) {
            console.log('vpkUTL036 - Error reading colors file: colors.json , message: ' + e);
            deferred.reject(e);
        }
    }

    
    
    
//end of export    
};