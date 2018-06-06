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

ClusterRole is a cluster level, logical grouping of PolicyRules that can be referenced as a unit by a 
RoleBinding or ClusterRoleBinding.

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseClusterRole = function(ns, kind, name, obj, src, part) {
    
    
    try {
        var rules = '';
        var lkey = ns + '.' + kind + '.' + name;
        // ClusterRolde is at cluster level for all namespaces
    
        if (typeof vpk.clusterRole[lkey] === 'undefined') {
            vpk.clusterRole[lkey] = [];
        } else {
            utl.logMsg('vpkCR002 - Duplicate clusterRole: ' + lkey, 'clusterRoleParse');
        }

        if (typeof obj.rules !== 'undefined') {
            rules = obj.rules;
        }

        var tmp = vpk.clusterRole[lkey];
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'rules': rules,
            'sourceFile': src,
            'sourcePart': part
        };
        tmp.push(item);
        // stats counter 
        vpk.clusterRoleCnt++;
        vpk.clusterRole[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkCR001 - Erro processing file: ' + src + ' part: ' + part + ' message: ' + err, 'clusterRoleParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseClusterRole(ns, kind, name, obj, src, part);

    }

};