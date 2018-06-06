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

/*------------------------------------------------------------------------------

PodPreset template

*/


var vpk = require('../lib/vpk');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parsePodPreset = function(ns, kind, name, obj, src, part) {
    
    try {
        var lkey = ns + '.' + kind + '.' + name;
        if (typeof vpk.podPreset[lkey] === 'undefined') {
            vpk.podPreset[lkey] = [];
        }
        var data;
        if (typeof obj !== 'undefined' && obj !== null) {
            data = obj;
        } else {
            data = ' ';
        }
        var tmp = vpk.podPreset[lkey];
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'data': data,
            'sourceFile': src,
            'sourcePart': part
        }
        tmp.push(item);
        // stats counter 
        vpk.podPresetCnt++;
        vpk.podPreset[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkPPS001 - Error processing file: ' + src + ' part: ' + part +  ' message: ' + err);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parsePodPreset(ns, kind, name, obj, src, part);

    }

};