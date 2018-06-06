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

User defined component

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseVolume = function(ns, kind, name, obj, rCnt, src, part, yk) {
    var doit = true;
    var e = -1;
    var v_name = '';
    var tmp;
    var item;
    var vkey;

    try {

        while (doit) {
            v_name = '';

            e++;
            if (typeof obj[e] !== 'undefined') {
                v_name = obj[e].name;
                if (typeof obj[e].configMap !== 'undefined') {
                    if (typeof obj[e].configMap.name !== 'undefined') {

                        // save info in use array
                        var cfkey = ns + '.' + obj[e].configMap.name;
                        if (typeof vpk.configMapUse[cfkey] === 'undefined') {
                            vpk.configMapUse[cfkey] = [];
                        }
                        var ctmp = vpk.configMapUse[cfkey];
                        var cUse = {
                            'namespace': ns,
                            'kind': kind,
                            'objName': name,
                            'configMap': obj[e].configMap.name,
                            'key': '',
                            'sourceFile': src,
                            'sourcePart': part
                        };

                        ctmp.push(cUse);
                        // stats counter 
                        vpk.configMapUseCnt++;
                        vpk.configMapUse[cfkey] = ctmp;
                    }
                }
                
                if (typeof obj[e].secret !== 'undefined') {
                    if (typeof obj[e].secret.secretName !== 'undefined') {

                        // save info in use array
                        var seckey = ns + '.' + obj[e].secret.secretName;
                        if (typeof vpk.secretsUse[seckey] === 'undefined') {
                            vpk.secretsUse[seckey] = [];
                        }
                        var stmp = vpk.secretsUse[seckey];
                        var sUse = {
                            'namespace': ns,
                            'kind': kind,
                            'objName': name,
                            'secret': obj[e].secret.secretName,
                            'key': '',
                            'sourceFile': src,
                            'sourcePart': part
                        };

                        stmp.push(sUse);
                        // stats counter 
                        vpk.secretsUseCnt++;
                        vpk.secretsUse[seckey] = stmp;
                    }
                }

                vkey = ns + '.' + kind + '.' + v_name;
                if (typeof vpk.volumes[vkey] === 'undefined') {
                    vpk.volumes[vkey] = [];

                    tmp = vpk.volumes[vkey];
                    item = {
                        'namespace': ns,
                        'kind': kind,
                        'objName': v_name,
                        'sourceFile': src,
                        'sourcePart': part
                    };

                    tmp.push(item);
                    // stats counter
                    vpk.volumesCnt++;
                    vpk.volumes[vkey] = tmp;
                }

                utl.checkKind('Volume','U');
                utl.countKind('Volume');

                vkey = ns + '.' + v_name;
                if (typeof vpk.volumesUse[vkey] === 'undefined') {
                    vpk.volumesUse[vkey] = [];
                }
                tmp = vpk.volumesUse[vkey];
                item = {
                    'namespace': ns,
                    'kind': yk,
                    'objName': name,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                // stats counter
                vpk.volumesUseCnt++;
                vpk.volumesUse[vkey] = tmp;

            } else {
                doit = false;
            }
        }

        // safety stop
        if (e > 1000) {
            doit = false;
        }

    } catch (err) {
        utl.logMsg('vpkVLP001 - Error processing file: ' + src + ' part: ' + part + '  message: ' + err, 'volumeParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // get started and check if any directories to process
    //------------------------------------------------------------------------------
    parse: function(ns, kind, name, obj, rCnt, src, part, yk) {

        parseVolume(ns, kind, name, obj, rCnt, src, part, yk);

    }

};