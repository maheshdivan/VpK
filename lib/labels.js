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
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // labels 
    //------------------------------------------------------------------------------
    checkLabels: function(ns, kind, name, src, part, yk) {
        try {

            // grab labels if they exist
            if (typeof vpk.yaml.metadata !== 'undefined') {
                if (typeof vpk.yaml.metadata.labels !== 'undefined') {
                    // check the kind definition 
                    utl.checkKind(kind,'U');

                    for (var key in vpk.yaml.metadata.labels) {
                        var value = vpk.yaml.metadata.labels[key];

                        var labelKey = ns + '.' + kind + '.' + key + '.' + value;
                        if (typeof vpk.labels[labelKey] === 'undefined') {
                            vpk.labels[labelKey] = [];
                        }
                        var tmp = vpk.labels[labelKey];
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
                        vpk.labelsCnt++;
                        vpk.labels[labelKey] = tmp;

                        // increment counts for this type of kind
                        utl.countKind(kind);

                        //xref labels
                        var xKey = ns + '.' + key + '.' + value;
                        if (typeof vpk.labelsUse[xKey] === 'undefined') {
                            vpk.labelsUse[xKey] = [];
                        }
                        tmp = vpk.labelsUse[xKey];
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
                        vpk.labelsUseCnt++;
                        vpk.labelsUse[xKey] = tmp;
                    }
                }
            }
        } catch (err) {
            utl.logMsg('vpkLBL555 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'labels');
        }
    },


    //------------------------------------------------------------------------------
    // spec.template.metadata.labels 
    //------------------------------------------------------------------------------
    checkSpecTemplateLabels: function(ns, kind, name, src, part, yk) {
        try {
            // grab spec.template labels if they exist
            if (typeof vpk.yaml.spec !== 'undefined') {
                if (typeof vpk.yaml.spec.template !== 'undefined') {
                    if (typeof vpk.yaml.spec.template.metadata !== 'undefined') {
                        if (typeof vpk.yaml.spec.template.metadata.labels !== 'undefined') {
                            // check the kind definition 
                            utl.checkKind(kind,'U');

                            for (var key in vpk.yaml.spec.template.metadata.labels) {
                                var value = vpk.yaml.spec.template.metadata.labels[key];

                                var labelKey = ns + '.' + kind + '.' + key + '.' + value;
                                if (typeof vpk.labels[labelKey] === 'undefined') {
                                    vpk.labels[labelKey] = [];
                                }
                                var tmp = vpk.labels[labelKey];
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
                                vpk.labelsCnt++;
                                vpk.labels[labelKey] = tmp;

                                // increment counts for this type of kind
                                utl.countKind(kind);

                                //xref labels
                                var xKey = ns + '.' + key + '.' + value;
                                if (typeof vpk.labelsUse[xKey] === 'undefined') {
                                    vpk.labelsUse[xKey] = [];
                                }
                                tmp = vpk.labelsUse[xKey];
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
                                vpk.labelsUseCnt++;
                                vpk.labelsUse[xKey] = tmp;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            utl.logMsg('vpkLBL556 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'labels');
        }
    },


    //------------------------------------------------------------------------------
    // spec.selector.matchLabels 
    //------------------------------------------------------------------------------
    checkSpecSelectorLabels: function(ns, kind, name, src, part) {
        try {
            // grab spec.template labels if they exist
            if (typeof vpk.yaml.spec !== 'undefined') {
                if (typeof vpk.yaml.spec.selector !== 'undefined') {
                    if (typeof vpk.yaml.spec.selector.matchLabels !== 'undefined') {
                        // check the kind definition 
                        utl.checkKind(kind,'U');

                        for (var key in vpk.yaml.spec.selector.matchLabels) {
                            var value = vpk.yaml.spec.selector.matchLabels[key];

                            var labelKey = ns + '.' + kind + '.' + key + '.' + value;
                            if (typeof vpk.labelsSpecSelector[labelKey] === 'undefined') {
                                vpk.labelsSpecSelector[labelKey] = [];
                            }
                            var tmp = vpk.labelsSpecSelector[labelKey];
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
                            vpk.labelsSpecSelectorCnt++;
                            vpk.labelsSpecSelector[labelKey] = tmp;

                            // increment counts for this type of kind
                            utl.countKind(kind);
                        }
                    }
                }
            }
        } catch (err) {
            utl.logMsg('vpkLBL557 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'labels');
        }
    }

    //end of export    
};