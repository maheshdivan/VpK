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

StatefulSet represents a set of pods with consistent identities. Identities are defined as:

- Network: A single stable DNS and hostname.

- Storage: As many VolumeClaims as requested. The StatefulSet guarantees that a given network 
identity will always map to the same storage identity.

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseStatefulSet = function(ns, kind, name, obj, src, part) {
	
    try {
        var lkey = ns + '.' + kind + '.' + name;
        if (typeof vpk.statefulSets[lkey] === 'undefined') {
            vpk.statefulSets[lkey] = [];
        }
        // doing nothing
        var type = '';

        var tmp = vpk.statefulSets[lkey];
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'type': type,
            'sourceFile': src,
            'sourcePart': part
        };
        tmp.push(item);
        // stats counter 
        vpk.statefulSetsCnt++;
        vpk.statefulSets[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkSTA001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'statefulSetParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseStatefulSet(ns, kind, name, obj, src, part);

    }

};