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


*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
  
//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parsePersistentVolume = function(ns, kind, name, obj, src, part) {
    var persistentVolume = {};
    var storClass;
    
    try {
        persistentVolume = {
            'namespace': ns,
            'kind': kind,
            'objName': name

        };
    
        if (typeof obj.capacity !== 'undefined') {
            if (typeof obj.capacity.storage !== 'undefined') {
                persistentVolume.storage = obj.capacity.storage;
            }
        }

        if (typeof obj.persistentVolumeReclaimPolicy !== 'undefined') {
            persistentVolume.reclaim = obj.persistentVolumeReclaimPolicy;
        }

        if (typeof obj.storageClassName !== 'undefined') {
            persistentVolume.storageClass = obj.storageClassName;
            storClass = obj.storageClassName;
        }

        if (typeof obj.accessModes !== 'undefined') {
            var hl = obj.accessModes.length;
            var modes = [];
            for (var m = 0; m < hl; m++) {
                modes.push(obj.accessModes[m]);
            }
            persistentVolume.accessModes = modes;
        }

        if (typeof obj.hostPath !== 'undefined') {
            if (typeof obj.hostPath.path !== 'undefined') {
                persistentVolume.hostPath = obj.hostPath.path;
            }
        }

        if (typeof obj.nfs !== 'undefined') {
            if (typeof obj.nfs.path !== 'undefined') {
                persistentVolume.nfsPath = obj.nfs.path;
            }
            if (typeof obj.nfs.server !== 'undefined') {
                persistentVolume.nfsServer = obj.nfs.server;
            }
        }

        if (typeof obj.local !== 'undefined' && obj.local !== null ) {
            if (typeof obj.local.path !== 'undefined') {
                persistentVolume.local = obj.local.path;
            }
        }


        var lkey = ns + '.' + kind + '.' + name;
        if (typeof vpk.persistentVolume[lkey] === 'undefined') {
            vpk.persistentVolume[lkey] = [];
        }
        var tmp = vpk.persistentVolume[lkey];
        persistentVolume.sourceFile = src;
        persistentVolume.sourcePart = part;
        tmp.push(persistentVolume);
        // stats counter for number of volumes
        vpk.persistentVolumeCnt++;
        vpk.persistentVolume[lkey] = tmp;

                
        // xref storage class usage
        var xkey = ns + '.' + storClass;
        if (typeof vpk.storageClassUse[xkey] === 'undefined') {
            vpk.storageClassUse[xkey] = [];
        }
        tmp = vpk.storageClassUse[xkey];
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'storgeClassName': storClass,
            'sourceFile': src,
            'sourcePart': part
        };
        tmp.push(item);
        vpk.storageClassUseCnt++;
        vpk.storageClassUse[xkey] = tmp;


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


    } catch (err) {
        utl.logMsg('vpkPVP001 - Error processing file: ' + src + ' part: ' + part + ' message: ' + err, 'persistentVolumeParse');
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, src, part) {

        parsePersistentVolume(ns, kind, name, obj, src, part);

    }

};