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

Secret holds secret data of a certain type. The total bytes of the values in the Data field must be 
less than MaxSecretSize bytes.

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseSecret = function(ns, kind, name, obj, src, part) {
    
    try {
        var lkey = ns + '.' + kind + '.' + name;
        if (typeof vpk.secrets[lkey] === 'undefined') {
            vpk.secrets[lkey] = [];
        }
        var type;
        if (typeof obj !== 'undefined' && obj !== null) {
            type = obj;
        } else {
            type = ' ';
        }
        var tmp = vpk.secrets[lkey];
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
        vpk.secretsCnt++;
        vpk.secrets[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkSEC001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'secretParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseSecret(ns, kind, name, obj, src, part);

    }

};