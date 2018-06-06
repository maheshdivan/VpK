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

User defined type.  

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseNodeSelector = function(ns, kind, name, obj, rCnt, src, part, yk) {

    try {
        if (typeof obj !== 'undefined') {
            for (item in obj) {
                var nkey = '';
                var key = item;
                var value = obj[item];

                nkey = ns + '.' + kind + '.' + key + '.' + value;
                if (typeof vpk.nodeSelector[nkey] === 'undefined') {
                    vpk.nodeSelector[nkey] = [];

                    var tmp = vpk.nodeSelector[nkey];
                    var item = {
                        'namespace': ns,
                        'kind': kind,
                        'objName': name,
                        'key': key,
                        'value': value,
                        'sourceFile': src,
                        'sourcePart': part
                    };
                    tmp.push(item);
                            
                    // stats counter 
                    vpk.nodeSelectorCnt++;
                    vpk.nodeSelector[nkey] = tmp;
                    
                    utl.checkKind(kind,'U');
                    utl.countKind(kind);
                } else {
                    vpk.nodeSelectorCnt++;
                }

                nkey = ns + '.' + key + '.' + value;
                if (typeof vpk.nodeSelectorUse[nkey] === 'undefined') {
                    vpk.nodeSelectorUse[nkey] = [];
                }
                tmp = vpk.nodeSelectorUse[nkey];
                item = {
                    'namespace': ns,
                    'kind': yk,
                    'objName': name,
                    'key': key,
                    'value': value,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                            
                // stats counter 
                vpk.nodeSelectorUseCnt++;
                vpk.nodeSelectorUse[nkey] = tmp;
            }
        }
    } catch (err) {
        utl.logMsg('vpkNOD001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'nodeSelectorParse');
    }
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, rCnt, src, part, yk) {

        parseNodeSelector(ns, kind, name, obj, rCnt, src, part, yk);

    }

};