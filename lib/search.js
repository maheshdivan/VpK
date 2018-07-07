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

Search definitions and types

*/


var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// loop through all types and determine if it should be included in results
//------------------------------------------------------------------------------
var searchAll = function(value, type, ns) {
    var data = [];
    var tmp;
    tmp = searchData(value, 'APIService', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Args', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'CertificateSigningRequest', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Command', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ConfigMap', ns);
    data = utl.combineData(data, tmp);

/* Decided not to show container since workloads 
   provides data
    tmp = searchData(value, 'Container', ns);
    data = utl.combineData(data, tmp);
*/
    tmp = searchData(value, 'ContainerImage', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ContainerName', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ClusterRole', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ClusterRoleBinding', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'ComponentStatus', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ControllerRevision', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'CronJob', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'CustomResourceDefinition', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'DaemonSet', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Deployment', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Endpoints', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Env', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Event', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'HorizontalPodAutoscaler', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Ingress', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'InitializerConfiguration', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Job', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Labels', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'LabelsSpecTemplate', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'LimitRange', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'LivenessProbe', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'Namespace', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'NetworkPolicy', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Node', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'NodeSelector', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PersistentVolume', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PersistentVolumeClaim', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PodDisruptionBudget', ns);                                      
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PodSecurityPolicy', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Pod', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PodPreset', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PodTemplates', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'PriorityClass', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ReadinessProbe', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'ReplicaSet', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ResourceQuota', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ReplicationController', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Role', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'RoleBinding', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Secret', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'SecretUse', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Selector', ns);
    data = utl.combineData(data, tmp);    
    tmp = searchData(value, 'Service', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'ServiceAccount', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'StatefulSet', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'StorageClass', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'TokenReview', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'Volume', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'VolumeAttachment', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'VolumeClaimTemplates', ns);
    data = utl.combineData(data, tmp);
    tmp = searchData(value, 'VolumeMounts', ns);
    data = utl.combineData(data, tmp);

    return data;

};

 
//------------------------------------------------------------------------------
// search the selected type and determine if it should be included in results
//------------------------------------------------------------------------------
var searchData = function(value, type, ns) {
    
    try {
        var data = '';

		if (type.endsWith(' (U)')) {
			var nt = type.split(' ');
			type = nt[0]
		}


 
        // find and filter
        switch (type) {
            case 'APIService':
                data = vpk.apiService;
                break;
            case 'Args':
                data = vpk.args;
                break;
            case 'CertificateSigningRequest':
                data = vpk.certificateSigningRequest;
                break;
            case 'ClusterRoleBinding':
                data = vpk.clusterRoleBinding;
                break;
            case 'ClusterRole':
                data = vpk.clusterRole;
                break;
            case 'Command':
                data = vpk.command;
                break;
            case 'ComponentStatus':
                data = vpk.componentStatuses;
                break;
            case 'ConfigMap':
                data = vpk.configMap;
                break;
            case 'ConfigMap':
                data = vpk.configMap;
                break;

/* Decided not to show container since workloads 
   provides data
            case 'Container':
                data = vpk.containers;
                break;
*/
            case 'ContainerName':
                data = vpk.containerName;
                break;
            case 'ContainerImage':
                data = vpk.containerImage;
                break;
            case 'ControllerRevision':
                data = vpk.controllerRevisions;
                break;
            case 'CronJob':
                data = vpk.cronJob;
                break;
            case 'CustomResourceDefinition':
                data = vpk.customResourceDefinitions;
                break;
            case 'DaemonSet':
                data = vpk.daemonSet;
                break;
            case 'Deployment':
                data = vpk.deployments;
                break;
            case 'Endpoints':
                data = vpk.endpoints;
                break;                
            case 'Env':
                data = vpk.env;
                break;
            case 'Event':
                data = vpk.events;
                break;                
            case 'HorizontalPodAutoscaler':
                data = vpk.horizontalPodAutoscaler;
                break;
            case 'Ingress':
                data = vpk.ingress;
                break;
            case 'InitializerConfiguration':
                data = vpk.initializerConfiguration;
                break;
            case 'Job':
                data = vpk.jobs;
                break;
            case 'Labels':
                data = vpk.labels;
                break;
            case 'LabelsSpecTemplate':
                data = vpk.labelsSpecTemplate;
                break;
            case 'LimitRange':
                data = vpk.limitRange;
                break;
            case 'LivenessProbe':
                data = vpk.livenessProbe;
                break;
            case 'List':
                data = vpk.lists;
                break;
            case 'Namespace':
                data = vpk.namespaces;
                break;
            case 'NetworkPolicy':
                data = vpk.networkPolicy;
                break;
            case 'Node':
                data = vpk.node;
                break;
            case 'NodeSelector':
                data = vpk.nodeSelector;
                break;
            case 'PersistentVolume':
                data = vpk.persistentVolume;
                break;    
            case 'PersistentVolumeClaim':
                data = vpk.persistentVolumeClaim;
                break;
            case 'PodDisruptionBudget':                                      
                data = vpk.podDisruptionBudget;
                break;
            case 'PodSecurityPolicy':
                data = vpk.podSecurityPolicy;
                break;
            case 'Pod':
                data = vpk.pod;
                break;
            case 'PodTemplates':
                data = vpk.podTemplates;
                break;
            case 'PodPreset':
                data = vpk.podPreset;
                break;
            case 'PriorityClass':
                data = vpk.podPreset;
                break;
            case 'ReadinessProbe':
                data = vpk.readinessProbe;
                break;
            case 'ReplicaSet':
                data = vpk.replicaSet;
                break;
            case 'ReplicationController':
                data = vpk.replicationController;
                break;
            case 'ResourceQuota':
                data = vpk.resourceQuota;
                break;
            case 'Role':
                data = vpk.role;
                break;
            case 'RoleBinding':
                data = vpk.roleBinding;
                break;
            case 'Secret':
                data = vpk.secrets;
                break;
            case 'SecretUse':
                data = vpk.secretsUse;
                break;
            case 'Selector':
                data = vpk.labelsSpecSelector;
                break;
            case 'Service':
                data = vpk.services;
                break;
            case 'ServiceAccount':
                data = vpk.serviceAccount;
                break;
            case 'StatefulSet':
                data = vpk.statefulSets;
                break;
            case 'StorageClass':
                data = vpk.storageClass;
                break;
            case 'TokenReview':
                data = vpk.tokenReview;
                break;
            case 'Volume':
                data = vpk.volumes;
                break;
            case 'VolumeAttachment':
                data = vpk.volumeAttachment;
                break;
            case 'VolumeClaimTemplates':
                data = vpk.volumeClaimTemplates;
                break;
            case 'VolumeMounts':
                data = vpk.volumeMounts;
                break;
            default:
                utl.logMsg('vpkSCH001 - Undefined kind in search: ' + type, 'search');
                data = {};
            }

         return filterData(data, value, ns, type);
    

    } catch (err) {
        utl.logMsg('vpkSCH002 - Error processing, message: ' + err, 'search');
        // vpk.xCnt++;
    }
};


//------------------------------------------------------------------------------
// determine if data should be include in result set
//------------------------------------------------------------------------------
var filterData = function(data, value, ns, type) {
    var checkValue = false;
    var v;
    var cv;
    var selected = [];
            
    try {

        var tmp;
        var item;
        var save = false;
        for (entry in data) {
            tmp = data[entry];
            
            // check if array if not make it an array
            if (typeof tmp[0] === 'undefined'){
                var newTmp = [];
                newTmp.push(tmp);
                tmp = newTmp;
            }
            
            save = false;
            // check for namespace match
            if (ns === 'all-namespaces') {
                save = true;
            } else {
                if (tmp[0].namespace === ns ) {
                    save = true; 
                } else {
                    save = false;
                    // not the needed namespace so skip
                    continue;
                }
            }

            v = value.trim();
            if (v !== null && v.length > 0) {
                checkValue = true;
            }


            // check for value match
            if (checkValue) {
                if (value === '*') {
                    save = true;
                } else {
                    cv = tmp[0].objName;

                    if (type === 'Labels' || type === 'LabelsSepcTemplate' || type === 'Selector' || type === 'NodeSelector') {
                        cv = tmp[0].key + ' = ' + tmp[0].value; 
                    }
                    if (type === 'ContainerImage') {
                        cv = tmp[0].image;
                    }
                    if (type === 'ContainerName') {
                        cv = tmp[0].containerRefName;
                    }
                
                    if (cv.indexOf(value) > -1) {
                        save = true;
                    } else {
                        save = false;
                    }
                }


                if (save) {
                    if (tmp.length > 1) {
                        //TODO: Research why kind Volume has more than one entry
                    } 
                    

                    if (typeof tmp[0].sourceFile === 'undefined') {
                        utl.logMsg('vpkSCH003 - No sourceFile definition in data - Namespace:' + tmp[0].namespace + '   Kind: ' + type + '   Name:' + tmp[0].objName, 'search');
                    } else {
                        if (typeof tmp[0].sourcePart === 'undefined') {
                            utl.logMsg('vpkSCH004 - No sourcePart definition in data - Namespace:' + tmp[0].namespace + '   Kind: ' + type + '   Name:' + tmp[0].objName, 'search');
                        } else {
                            var name = tmp[0].objName;
                            if (type === 'Labels' || type === 'LabelsSepcTemplate' || type === 'Selector' || type === 'NodeSelector') {
                                name = tmp[0].key + ' = ' + tmp[0].value;
                            }

                            if (type === 'ContainerName') {
                                name = tmp[0].containerRefName;
                            }
                            if (type === 'ContainerImage') {
                                name = tmp[0].image;
                            }

                            item = {
                                'namespace': tmp[0].namespace, 
                                'kind': type, 
                                'name': name, 
                                'src': tmp[0].sourceFile, 
                                'part': tmp[0].sourcePart, 
                                'key': tmp[0].namespace + type + name
                            };
                            selected.push(item);
                        }
                    }
                }
            }
        }
        // sort array to be returned
        selected.sort(arraySort('key'));
        
        return selected;            

    } catch (err) {
        utl.logMsg('vpkSCH005 - Error processing, message: ' + err, 'search');
    }
};

var arraySort = function(property) {
    var sortOrder = 1;
    if(property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    process: function(data) {
        var value = data.searchValue;
        var type  = data.searchType;
        var nsFilter = data.namespaceFilter;
        var rdata;

        // get all if search value is not set
        if (value.length === 0) {
            value = '*';
        }

        // check if all types(kinds) are to be searched 
        if (type !== 'all-kinds') {
            rdata = searchData(value, type, nsFilter);
        } else {
            rdata = searchAll(value, type, nsFilter);
        } 
        
        return rdata;

    }

};