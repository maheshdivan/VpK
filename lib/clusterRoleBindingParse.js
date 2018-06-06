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

ClusterRoleBinding references a ClusterRole, but not contain it. It can reference a ClusterRole in the 
global namespace, and adds who information via Subject.

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl'); 

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseClusterRoleBinding = function(ns, kind, name, obj, src, part) {
    try {
		var subjects = '';
		var roleRef = '';	
			
        var lkey = ns + '.' + kind + '.' + name;
		// ClusterRoleBinding is at cluster level for all namespaces
    
        if (typeof vpk.clusterRoleBinding[lkey] === 'undefined') {
            vpk.clusterRoleBinding[lkey] = [];
        } else {
            utl.logMsg('vpkCRB002 - Duplicate clusterRoleBinding: ' + lkey, 'clusterRoleBindingParse');
        }

        if (typeof obj.subjects !== 'undefined') {
            subjects = obj.subjects;
            subjects.sourceFile = src;
            subjects.sourcePart = part;
        }

        if (typeof obj.roleRef !== 'undefined') {
            roleRef = obj.roleRef;
            subjects.sourceFile = src;
            subjects.sourcePart = part;
        }

        var tmp = vpk.clusterRoleBinding[lkey];
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
			'subjects': subjects,
            'roleRef': roleRef,
            'sourceFile': src,
            'sourcePart': part
        };
        tmp.push(item);
        // stats counter 
        vpk.clusterRoleBindingCnt++;
        vpk.clusterRoleBinding[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkCRB001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'clusterRoleBindingParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseClusterRoleBinding(ns, kind, name, obj, src, part);

    }

};