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

RoleBinding references a role, but does not contain it. It can reference a Role in the same namespace 
or a ClusterRole in the global namespace. It adds who information via Subjects and namespace information 
by which namespace it exists in. RoleBindings in a given namespace only have effect in that namespace.

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
 
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseRoleBinding = function(ns, kind, name, obj, src, part) {
    
    
    try {
        var subjects = '';
        var roleRef = '';   
            
        var lkey = ns + '.' + kind + '.' + name;
        // RoleBinding is at cluster level for all namespaces
    
        if (typeof vpk.roleBinding[lkey] === 'undefined') {
            vpk.roleBinding[lkey] = [];
        } else {
            utl.logMsg('vpkCRB02 - Duplicate RoleBinding: ' + lkey);
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


        var tmp = vpk.roleBinding[lkey];
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
        vpk.roleBindingCnt++;
        vpk.roleBinding[lkey] = tmp;

    } catch (err) {
        utl.logMsg('vpkRBP01 - Error processing file: ' + src + ' part: ' + part +' message: ' + err, 'roleBindingParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parseRoleBinding(ns, kind, name, obj, src, part);

    }

};