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
var parseVolumeClaimTemplates = function(ns, kind, name, obj, src, part, yk) {

    try {
        var storClass = ' ';
        var vctName;
        var v;
        var tmp;
        var item;
        var xkey;
        
        for (v = 0; v < obj.length; v++) {
            if (typeof obj[v].spec !== 'undefined') {
                if (typeof obj[v].spec.storageClassName !== 'undefined') {
                    storClass = obj[v].spec.storageClassName;
                } else {
                    storClass = ' ';
                }
            }

            if (typeof obj[v].metadata !== 'undefined') {
                if (typeof obj[v].metadata.name !== 'undefined') {
                    vctName = obj[v].metadata.name;
                } else {
                    vctName = 'unknown';
                }
            }

            var lkey = ns + '.' + kind + '.' + vctName;
            if (typeof vpk.volumeClaimTemplates[lkey] === 'undefined') {
                vpk.volumeClaimTemplates[lkey] = [];
            

                tmp = vpk.volumeClaimTemplates[lkey];
                item = {
                    'namespace': ns,
                    'kind': kind,
                    'objName': vctName,
                    'storageClassName': storClass,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                // stats counter for number of volumes
                vpk.volumeClaimTemplatesCnt++;
                vpk.volumeClaimTemplates[lkey] = tmp;
            }
            
            utl.checkKind('VolumeClaimTemplates','U');
            utl.countKind('VolumeClaimTemplates');

            // xref volumeClaimTemplates
            xkey = ns + '.' + vctName;
            if (typeof vpk.volumeClaimTemplatesUse[xkey] === 'undefined') {
                vpk.volumeClaimTemplatesUse[xkey] = [];
            }
            tmp = vpk.volumeClaimTemplatesUse[xkey];
            item = {
                'namespace': ns,
                'kind': yk,
                'objName': name,
                'storgeClass': storClass,
                'sourceFile': src,
                'sourcePart': part
            };
            tmp.push(item);
            vpk.volumeClaimTemplatesUseCnt++;
            vpk.volumeClaimTemplatesUse[xkey] = tmp;

            // storage class use
            if (storClass !== ' ') {
                // xref storage class
                xkey = ns + '.' + storClass;
                if (typeof vpk.storageClassUse[xkey] === 'undefined') {
                    vpk.storageClassUse[xkey] = [];
                }
                tmp = vpk.storageClassUse[xkey];
                item = {
                    'namespace': ns,
                    'kind': yk,
                    'objName': name,
                    'storgeClass': storClass,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                vpk.storageClassUseCnt++;
                vpk.storageClassUse[xkey] = tmp;
            }

            // storage class name
            if (storClass !== ' ') {
                // xref storage class
                xkey = ns + '.' + 'StorageClass' + '.' + storClass;
                if (typeof vpk.storageClass[xkey] === 'undefined') {
                    vpk.storageClass[xkey] = [];
                }
                tmp = vpk.storageClass[xkey];
                item = {
                    'namespace': ns,
                    'kind': 'StorageClass',
                    'objName': storClass,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                vpk.storageClassCnt++;
                vpk.storageClass[xkey] = tmp;
            }

            utl.checkKind('StorageClass','U');
            utl.countKind('StorageClass');
        }
    } catch (err) {
        utl.logMsg('vpkVCT001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'volumeClaimTemplatesParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part, yk) {

        parseVolumeClaimTemplates(ns, kind, name, obj, src, part, yk);

    }

};