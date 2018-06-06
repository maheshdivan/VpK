
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

Component that reads, parses, and stores the yaml file information.

*/


// Requires
var vpk = require('../lib/vpk'),
    apiServiceParse = require('../lib/apiServiceParse'),
    certificateSigningRequestParse = require('../lib/certificateSigningRequestParse'),
    clusterRoleParse = require('../lib/clusterRoleParse'),
    clusterRoleBindingParse = require('../lib/clusterRoleBindingParse'),
    componentStatusesParse = require('../lib/componentStatusesParse'),
    containerParse = require('../lib/containerParse'),
    configMapParse = require('../lib/configMapParse'),
    controllerRevisionParse = require('../lib/controllerRevisionParse'),
    cronJobParse = require('../lib/cronJobParse'),
    customResourceDefinitionParse = require('../lib/customResourceDefinitionParse'),
    daemonSetParse = require('../lib/daemonSetParse'),
    deploymentParse = require('../lib/deploymentParse'),
    endpointsParse = require('../lib/endpointsParse'),
    eventsParse = require('../lib/eventsParse'),
    genericParse = require('../lib/genericParse'),
    horizontalPodAutoscalerParse = require('../lib/horizontalPodAutoscalerParse'),
    ingressParse = require('../lib/ingressParse'),
    initializerConfigurationParse = require('../lib/initializerConfigurationParse'),
    jobParse = require('../lib/jobParse'),
    limitRangeParse = require('../lib/limitRangeParse'),
    listParse = require('../lib/listParse'),
    namespaceParse = require('../lib/namespaceParse'),
    networkPolicyParse = require('../lib/networkPolicyParse'),
    nodeParse = require('../lib/nodeParse'),
    nodeSelectorParse = require('../lib/nodeSelectorParse'),
    persistentVolumeParse = require('../lib/persistentVolumeParse'),
    persistentVolumeClaimParse = require('../lib/persistentVolumeClaimParse'),
    podParse = require('../lib/podParse'),
    podPresetParse = require('../lib/podPresetParse'),
    podDisruptionBudgetParse = require('../lib/podDisruptionBudgetParse'),
    podSecurityPolicyParse = require('../lib/podSecurityPolicyParse'),
    priorityClassParse = require('../lib/priorityClassParse'),
    replicaSetParse = require('../lib/replicaSetParse'),
    replicationControllerParse = require('../lib/replicationControllerParse'),
    resourceQuotaParse = require('../lib/resourceQuotaParse'),
    roleParse = require('../lib/roleParse'),
    roleBindingParse = require('../lib/roleBindingParse'),
    secretParse = require('../lib/secretParse'),
    serviceParse = require('../lib/serviceParse'),
    serviceAccountParse = require('../lib/serviceAccountParse'),
    statefulSetParse = require('../lib/statefulSetParse'),
    storageClassParse = require('../lib/storageClassParse'),
    tokenReviewParse = require('../lib/tokenReviewParse'),
    volumeParse = require('../lib/volumeParse'),
    volumeAttachmentParse = require('../lib/volumeAttachmentParse'),
    volumeClaimTemplatesParse = require('../lib/volumeClaimTemplatesParse'),
    fs = require('fs'),
    path = require('path'),
    YAML = require('js-yaml'),
    utl = require('../lib/utl'),
    lbl = require('../lib/labels');



//------------------------------------------------------------------------------
// read directory and populate file array 
//------------------------------------------------------------------------------
var readDIR = function(p) {
    vpk.baseFS = [];
    try {
        vpk.baseFS = fs.readdirSync(p);
    } catch (err) {
        utl.logMsg('vpkFIO001 - Error - Reading directory, message: = ' + err, 'fileio');
        // clear the file array since there is an error and not able to process
        vpk.baseFS = [];
    }
};


//------------------------------------------------------------------------------
// loop through the results of the directory read
//------------------------------------------------------------------------------
var loopBaseFS = function() {
    var hl = vpk.baseFS.length; // number of files in file array
    var fn; // filename
    var rf; // real file not a directory

    for (var i = 0; i < hl; i++) {

        // build file name to process
        fn = path.join(vpk.dirname, vpk.baseFS[i]);

        // is this a file or a directory
        rf = fs.statSync(fn).isFile();

        if (rf) {
            vpk.fCnt++;
            loadFILE(fn);
        } else {
            // Not a file, so it's a directory, add to directory array to process
            //TODO - add capability to check if sub-dir processing is defined
            vpk.dCnt++;
            vpk.dirFS.push(fn);
        }
    }

    // done processing file in directory, clear the file array
    vpk.baseFS = [];
};


//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var loadFILE = function(fn) {
    var contents;
    var hl = 0;
    var part = 0;
    vpk.yaml = '';

    try {
        contents = YAML.safeLoadAll(fs.readFileSync(fn)); //js-yaml 

        // determine if this is a valid kubernetes yaml file			
        if (typeof contents[0] !== 'undefined' && contents[0] !== null) {
            hl = contents.length;
        } else {
            hl = 1;
        }

        if (contents[0] !== null) {
            for (part = 0; part < hl; part++) {
                vpk.yaml = contents[part];
                processYAML(fn, part);
            }
        }
    } catch (err) {
        utl.logMsg('vpkFIO001 - Skipped file, unable to parse as YAML, file name: ' + fn, 'fileio');
        vpk.xCnt++;
    }
};


//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var processYAML = function(fn, part) {
    var valid = true; // indicate if yaml is valid, true = yes, false = no
    var y_ns = '';
    var y_kind = '';
    var y_name = '';
    var rCnt = 0;

    try {

        // determine if this is a valid kubernetes yaml file			
        if (typeof vpk.yaml !== 'undefined') {
            if (typeof vpk.yaml.apiVersion !== 'undefined') {
                //y_apiV = vpk.yaml.apiVersion;
                if (typeof vpk.yaml.kind !== 'undefined') {
                    y_kind = vpk.yaml.kind;
                    if (y_kind === 'List') {

                        // save file contents
                        utl.saveFileContents(fn, part, vpk.yaml);

                        // parse type
                        listParse.parse('not-defined', y_kind, 'global', vpk.yaml, fn, part);

                        // increment counts for this type of kind
                        utl.countKind(y_kind);

                        // save kind type name
                        utl.checkKind(y_kind);

                        return;
                    }
                } else {
                    valid = false;
                }
            } else {
                valid = false;
            }
        }

        // check if metadata tag is found
        if (valid) {
            if (typeof vpk.yaml.metadata !== 'undefined') {
                if (typeof vpk.yaml.metadata.name !== 'undefined') {
                    y_name = vpk.yaml.metadata.name;
                } else {
                    valid = false;
                }
            }
        } else {
        	console.log('skipped file: ' + fn)
        }


        // if valid yaml print data
        if (valid) {

            //save the file contents
            utl.saveFileContents(fn, part, vpk.yaml);

            // get and/or set namespace 
            if (typeof vpk.yaml.metadata.namespace !== 'undefined') {
                y_ns = vpk.yaml.metadata.namespace;
            } else {
                y_ns = 'not-defined';
            }

            // add to located list of namespaces
            utl.checkDefinedNamespace(y_ns);

            // increment counts for this type of kind
            utl.countKind(y_kind);

            // check the kind definition 
            utl.checkKind(y_kind);

            // check if labels or spec.template labels exist
            lbl.checkLabels(y_ns, 'Labels', y_name, fn, part, y_kind);

            // check if spec.template labels exist
            lbl.checkSpecTemplateLabels(y_ns, 'Labels', y_name, fn, part, y_kind);

            // check if spec.selector labels exist
            lbl.checkSpecSelectorLabels(y_ns, 'Selector', y_name, fn, part, y_kind);


            // parse and populate
            switch (y_kind) {
                case 'APIService':
                    processAPIService('cluster-level', y_kind, y_name, fn, part);
                    utl.checkDefinedNamespace('cluster-level');
                    break;
                case 'CertificateSigningRequest':
                    processCertificateSigningRequest(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ConfigMap':
                    processConfigMap(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ClusterRole':
                    processClusterRole('cluster-level', y_kind, y_name, fn, part);
                    utl.checkDefinedNamespace('cluster-level');
                    break;
                case 'ClusterRoleBinding':
                    processClusterRoleBinding('cluster-level', y_kind, y_name, fn, part);
                    utl.checkDefinedNamespace('cluster-level');
                    break;
                case 'ControllerRevision':
                    processControllerRevision(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ComponentStatus':
                    processComponentStatuses(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'CronJob':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processCronJob(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'CustomResourceDefinition':
                    processCustomResourceDefinition(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'DaemonSet':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processDaemonSet(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Deployment':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processDeployment(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Endpoints':
                    processEndpoints(y_ns, y_kind, y_name, fn, part);
                    break;                    
                case 'Event':
                    processEvents(y_ns, y_kind, y_name, fn, part);
                    break;                    
                case 'HorizontalPodAutoscaler':
                    processHorizontalPodAutoscaler(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Ingress':
                    processIngress(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'InitializerConfiguration':
                    processInitializerConfiguration(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Job':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processJob(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'LimitRange':
                    processLimitRange(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Namespace':
                    processNamespace(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'NetworkPolicy':
                    processNetworkPolicy(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Node':
                    processNode(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PersistentVolume':
                    processPersistentVolume('cluster-level', y_kind, y_name, fn, part);
                    utl.checkDefinedNamespace('cluster-level');
                    break;
                case 'PersistentVolumeClaim':
                    processPersistentVolumeClaim(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Pod':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processPod(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PodPreset':
                    processPodPreset(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PodDisruptionBudget':
                    processPodDisruptionBudget(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PodSecurityPolicy':
                    processPodSecurityPolicy(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'PriorityClass':
                    processPriorityClass(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ReplicaSet':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processReplicaSet(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ReplicationController':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processReplicationController(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ResourceQuota':
                    processRole(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Role':
                    processRole(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'RoleBinding':
                    processRoleBinding(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Secret':
                    processSecret(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'Service':
                    processService(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'ServiceAccount':
                    processServiceAccount(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'StatefulSet':
                    processContainer(y_ns, y_kind, y_name, fn, part, rCnt);
                    processStatefulSet(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'StorageClass':
                    processStorageClass(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'TokenReview':
                    processTokenReview(y_ns, y_kind, y_name, fn, part);
                    break;
                case 'VolumeAttachment':
                    processVolumeAttachment(y_ns, y_kind, y_name, fn, part);
                    break;
                default:
                    utl.logMsg('vpkFIO004 - Undefined kind: ' + y_kind + ' file:' + fn + ' part: ' + part, 'fileio');
                    processGeneric(y_ns, y_kind, y_name, fn, part);
            }

            // increment yaml counter
            vpk.yCnt++;

        } else {
            // increment x counter, x = not Kube YAML
            vpk.xCnt++;
        }

    } catch (err) {
        utl.logMsg('vpkFIO005 - Error processing error file: ' + fn + ' part: ' + part + ' message: ' + err.message, 'fileio');
        vpk.xCnt++;
    }
};


var processGeneric = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        utl.logMsg('vpkFIO006 - Parsing undefined kind: ' + y_kind + ' , file: ' + fn + ' part: ' + part, 'fileio');
        genericParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO007 - Empty yaml ' + y_kind + ' file: ' + fn + ' part: ' + part, 'fileio');
    }
};


var processContainer = function(y_ns, y_kind, y_name, fn, part, rCnt) {
    if (typeof vpk.yaml.spec.replicas !== 'undefined') {
        rCnt = vpk.yaml.spec.replicas;
    } else {
        rCnt = 0;
    }

    if (typeof vpk.yaml.spec.containers !== 'undefined') {
        containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.containers, rCnt, fn, part, 'C');
    }

    if (typeof vpk.yaml.spec.initContainers !== 'undefined') {
        containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.containers, rCnt, fn, part, 'I');
    }

    if (typeof vpk.yaml.spec.volumes !== 'undefined') {
        volumeParse.parse(y_ns, 'Volume', y_name, vpk.yaml.spec.volumes, rCnt, fn, part, y_kind);
    }

    if (typeof vpk.yaml.spec.volumeClaimTemplates !== 'undefined') {
        volumeClaimTemplatesParse.parse(y_ns, 'VolumeClaimTemplates', y_name, vpk.yaml.spec.volumeClaimTemplates, fn, part, y_kind);
    }

    if (typeof vpk.yaml.spec.nodeSelector !== 'undefined') {
        nodeSelectorParse.parse(y_ns, 'NodeSelector', y_name, vpk.yaml.spec.nodeSelector, rCnt, fn, part, y_kind);
    }

///////
    if (typeof vpk.yaml.spec.template !== 'undefined') {
    	if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
	    	if (typeof vpk.yaml.spec.template.spec.containers !== 'undefined') {
    	    	containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec.containers, rCnt, fn, part, 'C');
			}    
		}    
	}

    if (typeof vpk.yaml.spec.template !== 'undefined') {
	    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
    		if (typeof vpk.yaml.spec.template.spec.initContainers !== 'undefined') {
        		containerParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec.initContainers, rCnt, fn, part, 'I');
    		}
    	}
    }

    if (typeof vpk.yaml.spec.template !== 'undefined') {
	    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
    		if (typeof vpk.yaml.spec.template.spec.volumes !== 'undefined') {
        		volumeParse.parse(y_ns, 'Volume', y_name, vpk.yaml.spec.template.spec.volumes, rCnt, fn, part, y_kind);
    		}
    	}
    }

    if (typeof vpk.yaml.spec !== 'undefined') {
	    if (typeof vpk.yaml.spec.volumeClaimTemplates !== 'undefined') {
        	volumeClaimTemplatesParse.parse(y_ns, 'VolumeClaimTemplates', y_name, vpk.yaml.spec.volumeClaimTemplates, fn, part, y_kind);
    	}
    }

    if (typeof vpk.yaml.spec.template !== 'undefined') {
    	if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
    		if (typeof vpk.yaml.spec.template.spec.nodeSelector !== 'undefined') {
        		nodeSelectorParse.parse(y_ns, 'NodeSelector', y_name, vpk.yaml.spec.template.spec.nodeSelector, rCnt, fn, part, y_kind);
			}
		}
    }

};

var processAPIService = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec !== 'undefined') {
        apiServiceParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO008 - Empty APIService file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processCertificateSigningRequest = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        certificateSigningRequestParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO048 - Empty CertificateSigningRequest file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processComponentStatuses = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        componentStatusesParse.parse(y_ns, y_kind, y_name, vpk.yaml.data, fn, part);
    } else {
        utl.logMsg('vpkFIO009 - Empty componentStatuses file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processConfigMap = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.data !== 'undefined') {
        configMapParse.parse(y_ns, y_kind, y_name, vpk.yaml.data, fn, part);
    } else {
        utl.logMsg('vpkFIO009 - Empty configMap file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processControllerRevision = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        controllerRevisionParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO012 - Empty controllerRevision file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processClusterRole = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        clusterRoleParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO010 - Empty clusterRole file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processClusterRoleBinding = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        clusterRoleBindingParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO011 - Empty clusterRoleBinding file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processCronJob = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        cronJobParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO012 - Empty cronJob file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processCustomResourceDefinition = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        customResourceDefinitionParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO012 - Empty CustomResourceDefinition file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processDaemonSet = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
        daemonSetParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO013 - Empty daemon file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processDeployment = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
        deploymentParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO014 - Empty deployment file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processEndpoints = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        endpointsParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO015 - Empty endpoints file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processEvents = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        eventsParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO015 - Empty events file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processHorizontalPodAutoscaler = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        horizontalPodAutoscalerParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO041 - Empty horizontalPodAutoscaler file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processIngress = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        ingressParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO015 - Empty ingress file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processInitializerConfiguration = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        initializerConfigurationParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO042 - Empty initializerConfiguration file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processJob = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec.template.spec !== 'undefined') {
        jobParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec.template.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO016 - Empty secret file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processLimitRange = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        limitRangeParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO040 - Empty LimitRange file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processNamespace = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        namespaceParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO017 - Empty Namespace file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processNetworkPolicy = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        networkPolicyParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO046 - Empty NetworkPolicy file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processNode = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        nodeParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO044 - Empty node file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPersistentVolume = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec !== 'undefined') {
        //loadKind(y_ns, y_kind, y_name, fn, vpk.yaml.spec, null, null)
        persistentVolumeParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO018 - Empty PersistentVolume file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPersistentVolumeClaim = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec !== 'undefined') {
        //loadKind(y_ns, y_kind, y_name, fn, vpk.yaml.spec, null, null)
        persistentVolumeClaimParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO019 - Empty PersistentVolumeClaim file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPod = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        podParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO020 - Empty Pod file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPodPreset = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        podPresetParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO020 - Empty PodPreset file: ' + fn + ' part: ' + part, 'fileio');
    }
};
var processPodDisruptionBudget = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        podDisruptionBudgetParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO021 - Empty PodDisruptionBudget file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPodSecurityPolicy = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        podSecurityPolicyParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO022 - Empty PodSecurityPolicy file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processPriorityClass = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        priorityClassParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO043 - Empty priorityClass file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processResourceQuota = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        resourceQuotaParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO023 - Empty ResourceQuota definition, file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processRole = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        roleParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO023 - Empty Role definition, file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processRoleBinding = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        roleBindingParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO024 - Empty RoleBinding file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processSecret = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.data !== 'undefined') {
        secretParse.parse(y_ns, y_kind, y_name, vpk.yaml.type, fn, part);
    } else {
        utl.logMsg('vpkFIO025 - Empty Secret file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processServiceAccount = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        serviceAccountParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO048 - Empty ServiceAccount file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processService = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec !== 'undefined') {
        serviceParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO026 - Empty Service file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processStatefulSet = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml.spec !== 'undefined') {
        statefulSetParse.parse(y_ns, y_kind, y_name, vpk.yaml.spec, fn, part);
    } else {
        utl.logMsg('vpkFIO027 - Empty Service file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processStorageClass = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        storageClassParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO028 - Empty StorageClass file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processTokenReview = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        tokenReviewParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO047 - Empty TokenReview file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processReplicaSet = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        replicaSetParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO029 - Empty Service file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processReplicationController = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        replicationControllerParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO030 - Empty Service file: ' + fn + ' part: ' + part, 'fileio');
    }
};

var processVolumeAttachment = function(y_ns, y_kind, y_name, fn, part) {
    if (typeof vpk.yaml !== 'undefined') {
        volumeAttachmentParse.parse(y_ns, y_kind, y_name, vpk.yaml, fn, part);
    } else {
        utl.logMsg('vpkFIO031 - Empty VolumeAttachment file: ' + fn + ' part: ' + part, 'fileio');
    }
};



//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    checkDir: function() {

        // check if there are any directories to be processed, if none stop looping
        if (vpk.dirPtr + 1 >= vpk.dirFS.length) {
            vpk.loop = false;
        } else {
            // get directory name off stack and read
            vpk.dirPtr++;
            vpk.dirname = vpk.dirFS[vpk.dirPtr];
            readDIR(vpk.dirname);
        }

        // determine if all files have been processed
        if (typeof vpk.baseFS[0] != 'undefined') {
            loopBaseFS();
        }

        // done with this directory
        return;
    }

};