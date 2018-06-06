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

Global VPK reset object.

*/

 
var vpk = require('../lib/vpk');

var clearAll = function() { 

    // validation failure counts
    vpk.vCnt = 0;
    vpk.tCnt = 0;
    vpk.rCnt = 0;
    vpk.pCnt = 0;
    vpk.repCnt = 0;
    
    //global work vars for files and directories
    vpk.baseFS = '';
    vpk.filesFS = [];
    vpk.dirFS = [];
    vpk.dirPtr = -1;
    vpk.dirname = '';

    //starting directory name
    vpk.startDir = '-none-';

    //process flag
    vpk.loop = true;

    //run stats
    vpk.dCnt = 0;
    vpk.fCnt = 0;
    vpk.yCnt = 0;
    vpk.xCnt = 0;    
    
    vpk.yaml = '';
    vpk.yBASE = 0;

    vpk.k_cont = new Object();

    vpk.file_sources = [];
    vpk.file_id = 0;
    
    vpk.fileContent = {};
    vpk.fileContentCnt = 0;

    vpk.apiService = {};
    vpk.apiServiceCnt = 0;
    
    vpk.certificateSigningRequest = {};
    vpk.certificateSigningRequestCnt = 0;
    
    vpk.clusterRole = {};
    vpk.clusterRoleCnt = 0;
    
    vpk.clusterRoleBinding = {};
    vpk.clusterRoleBindingCnt = 0;
    
    vpk.configMap = {};
    vpk.configMapCnt = 0;
    
    vpk.configMapUse = {};
    vpk.configMapUseCnt = 0;
    
    vpk.cronJob = {};
    vpk.cronJobCnt = 0;

    vpk.daemonSet = {};
    vpk.daemonSetCnt = 0;

    vpk.deployments = {};
    vpk.deploymentsCnt = 0;

    vpk.endpoints = {};
    vpk.endpointsCnt = 0;

	vpk.horizontalPodAutoscaler = {};
	vpk.horizontalPodAutoscalerCnt = 0;

    vpk.ingress = {};
    vpk.ingressCnt = 0;

    vpk.ingressUse = {};
    vpk.ingressUSeCnt = 0;

	vpk.initializerConfiguration = {};
	vpk.initializerConfigurationCnt = 0;

    vpk.jobs = {};
    vpk.jobsCnt = 0;

    vpk.limitRange =  {};
    vpk.limitRangeCnt = 0

    vpk.lists = {};
    vpk.listsCnt = 0;

    vpk.namespaces = {};
    vpk.namespacesCnt = 0;

    vpk.networkPolicy = {};
    vpk.networkPolicyCnt = 0;

    vpk.node = {};
    vpk.nodeCnt = 0;

    vpk.persistentVolume = {};
    vpk.persistentVolumeCnt = 0;

    vpk.persistentVolumeClaim = {};
    vpk.persistentVolumeClaimCnt = 0;

    vpk.pod = {};
    vpk.podCnt = 0;

    vpk.podPreset = {};
    vpk.podPresetCnt = 0;

    vpk.podDisruptionBudget = {};
    vpk.podDisruptionBudgetCnt = 0;

    vpk.podSecurityPolicy = {};
    vpk.podSecurityPolicyCnt = 0;

    vpk.priorityClass = {};
    vpk.priorityClassCnt = 0;

    vpk.pvs = {};
    vpk.pvsCnt = 0;

    vpk.replicaSet = {};
    vpk.replicaSetCnt = 0;

    vpk.replicationController = {};
    vpk.replicationControllerCnt = 0;
    
    vpk.resourceQuota = {};
    vpk.resourceQuotaCnt = 0;
    
    vpk.role = {};
    vpk.roleCnt = 0;
    
    vpk.roleBinding = {};
    vpk.roleBindingCnt = 0;

    vpk.secrets = {};
    vpk.secretsCnt = 0;

    vpk.secretsUse = {};
    vpk.secretsUSeCnt = 0;

    vpk.services = {};
    vpk.servicesCnt = 0;

    vpk.serviceAccount = {};
    vpk.serviceAccountCnt = 0;

    vpk.statefulSets = {};
    vpk.statefulSetsCnt = 0;

    vpk.storageClass = {};
    vpk.storageClassCnt = 0;

    vpk.storageClassUse = {};
    vpk.storageClassUseCnt = 0;

    vpk.tokenReview = {};
    vpk.tokenReviewCnt = 0;

    vpk.volumes = {};
    vpk.volumesCnt = 0;

    vpk.volumesUse = {};
    vpk.volumesUseCnt = 0;

    vpk.volumeAttachment = {};
    vpk.volumeAttachmentCnt = 0;

    vpk.volumeClaimTemplates = {};
    vpk.volumeClaimTemplatesCnt = 0;

    vpk.volumeClaimTemplatesUse = {};
    vpk.volumeClaimTemplatesUseCnt = 0;

    vpk.volumeMounts = {};
    vpk.volumeMountsCnt = 0;

    vpk.volumeMountsUse = {};
    vpk.volumeMountsUseCnt = 0;

    //-------------------   User defined 

    vpk.kinds = {};
    vpk.kindStats = {};
    
    vpk.definedNamespaces = {
        'all-namespaces': 'all-namespaces'
    };

    vpk.generic = {};
    vpk.genericCnt = 0;
      
    // counts of things parsed or processed
    vpk.containers = {};
    vpk.containerCnt = 0;
    vpk.iContainerCnt = 0;
    
    vpk.containerId = 1000;
    
    vpk.mntVol = [];
    vpk.mntCnt = 0;

    vpk.containerImage = {};
    vpk.containerImageCnt = 0;
    
    vpk.containerImageUse = {};
    vpk.containerImageUseCnt = 0;
    
    vpk.containerName = {};
    vpk.containerNameCnt = 0;

    vpk.ports = {};
    vpk.portsCnt = 0;

    vpk.nodeSelector = {};
    vpk.nodeSelectorCnt = 0;
    
    vpk.nodeSelectorUse = {};
    vpk.nodeSelectorUseCnt = 0;

    vpk.configMapUsage = {};
    vpk.secretUsage = {};
    vpk.fieldUsage = {};
    
    vpk.labels= {};
    vpk.labelsCnt = 0;
    
    vpk.labelsUse= {};
    vpk.labelsUSeCnt = 0;
    
    vpk.labelsSpecTemplate = {};
    vpk.labelsSpecTemplateCnt = 0;
    
    vpk.labelsSpecSelector = {};
    vpk.labelsSpecSelectorCnt = 0;
    
    vpk.selectorLabels = {};
    vpk.selectorLabelsCnt = 0;
    
    vpk.vpkLogMsg = [];
    
    //last var/holder
    vpk.do_not_delete = 'do not delete';
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // reset all variable in vpk
    //------------------------------------------------------------------------------
    resetAll: function() {
        clearAll();
    }

};


