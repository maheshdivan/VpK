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

Service is a named abstraction of software service (for example, mysql) consisting of local port 
(for example 3306) that the proxy listens on, and the selector that determines which pods will 
answer requests sent through the proxy.

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseService = function(ns, kind, name, obj, src, part) {
    
    try {
        var lkey = ns + '.' + kind + '.' + name;
        if (typeof vpk.services[lkey] === 'undefined') {
            vpk.services[lkey] = [];
        }
        var ports = [];
        var p_data = {};
        if (typeof obj.ports !== 'undefined' && obj !== null) {
            var hl = obj.ports.length;
            for (var p = 0; p < hl; p++) {
                p_data = {};
                if (typeof obj.ports[p] !== 'undefined') {
                    if (typeof obj.ports[p].name !== 'undefined') {
                        p_data.name = obj.ports[p].name;
                    }
                    if (typeof obj.ports[p].port !== 'undefined') {
                        p_data.port = obj.ports[p].port;
                    }
                    if (typeof obj.ports[p].targetPort !== 'undefined') {
                        p_data.target = obj.ports[p].target;
                    }
                    
                    ports.push(p_data);
                }
            }
        } else {
            ports = [];
        }
        
        var tmp;
        var item;
        
        // add selector labesls if they exist
        if (typeof obj.selector !== 'undefined') {
            for(var key in obj.selector){
                var value = obj.selector[key];
                var labelKey = ns + '.' + kind + '.' + name + '.' + key;
                if (typeof vpk.selectorLabels[labelKey] === 'undefined') {
                    vpk.selectorLabels[labelKey] = [];
                }
                tmp = vpk.selectorLabels[labelKey];
                item = {
                    'namespace': ns, 
                    'kind': kind, 
                    'objName': name, 
                    'key': key, 
                    'value': value,  
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmp.push(item);
                vpk.selectorLabelsCnt++;
                vpk.selectorLabels[labelKey] = tmp;
            }   
        }
        
        tmp = vpk.services[lkey];
        item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'ports': ports,
            'sourceFile': src,
            'sourcePart': part
        };
        tmp.push(item);
        // stats counter 
        vpk.servicesCnt++;
        vpk.services[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkSVC001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'serviceParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseService(ns, kind, name, obj, src, part);

    }

};