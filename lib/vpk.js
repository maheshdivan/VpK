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

Global VPK object.

*/




var vpk = module.exports = {

    // validation failure counts
    vCnt: 0,
    tCnt: 0,
    rCnt: 0,
    pCnt: 0,
    repCnt: 0,
    
    //global work vars for files and directories
    baseFS: '',
    filesFS: [],
    dirFS: [],
    dirPtr: -1,
    dirname: '',

    //starting directory name
    startDir: '-none-',

    //process flag
    loop: true,

    //run stats
    dCnt: 0,
    fCnt: 0,
    yCnt: 0,
    xCnt: 0,    
    
    yaml: '',
    yBASE: 0, 

    k_cont: new Object(),

    file_sources: [],
    file_id: 0,
    
    fileContent: {},
    fileContentCnt: 0,

    apiService: {},
    apiServiceCnt: 0,

    args: {},
    argsCnt: 0,
    
    certificateSigningRequest: {},
    certificateSigningRequestCnt: 0,

    clusterRole: {},
    clusterRoleCnt: 0,
        
    clusterRoleBinding: {},
    clusterRoleBindingCnt: 0,
    
    command: {},
    commandCnt: 0,
    
    componentStatuses: {},
    componentStatusesCnt: 0,
    
    configMap: {},
    configMapCnt: 0,
    
    configMapUse: {},
    configMapUseCnt: 0,
    
    controllerRevisions: {},
    controllerRevisionsCnt: 0,
    
    cronJob: {},
    cronJobCnt: 0,

    customResourceDefinitions: {},
    customResourceDefinitionsCnt: 0,

    daemonSet: {},
    daemonSetCnt: 0,

    deployments: {},
    deploymentsCnt: 0,

    endpoints: {},
    endpointsCnt: 0,
    
    env: {},
    envCnt: 0,

    events: {},
    eventsCnt: 0,

	horizontalPodAutoscaler: {},
	horizontalPodAutoscalerCnt: 0,
    
    ingress: {},
    ingressCnt: 0,

    ingressUse: {},
    ingressUSeCnt: 0,

	initializerConfiguration: {},
	initializerConfigurationCnt: 0,
	
    jobs: {},
    jobsCnt: 0,

    limitRange: {},
    limitRangeCnt: 0,

    lists: {},
    listsCnt: 0,

    livenessProbe: {},
    livenessProbeCnt: 0,

    namespaces: {},
    namespacesCnt: 0,

    networkPolicy: {},
    networkPolicyCnt: 0,

    node: {},
    nodeCnt: 0,

    persistentVolume: {},
    persistentVolumeCnt: 0,

    persistentVolumeClaim: {},
    persistentVolumeClaimCnt: 0,

    pod: {},
    podCnt: 0,

    podPreset: {},
    podPresetCnt: 0,

    podDisruptionBudget: {},
    podDisruptionBudgetCnt: 0,

    podSecurityPolicy: {},
    podSecurityPolicyCnt: 0,

    podTemplates: {},
    podTemplatesCnt: 0,

    priorityClass: {},
    priorityClassCnt: 0,

    pvs: {},
    pvsCnt: 0,

    readinessProbe: {},
    readinessProbeCnt: 0,

    replicaSet: {},
    replicaSetCnt: 0,

    replicationController: {},
    replicationControllerCnt: 0,
    
    resourceQuota: {},
    resourceQuotaCnt: 0,
    
    role: {},
    roleCnt: 0,
    
    roleBinding: {},
    roleBindingCnt: 0,

    secrets: {},
    secretsCnt: 0,

    secretsUse: {},
    secretsUseCnt: 0,

    services: {},
    servicesUseCnt: 0,

    serviceAccount: {},
    serviceAccountCnt: 0,

    statefulSets: {},
    statefulSetsCnt: 0,

    storageClass: {},
    storageClassCnt: 0,

    storageClassUse: {},
    storageClassUseCnt: 0,

    tokenReview: {},
    tokenReviewCnt: 0,

    volumes: {},
    volumesCnt: 0,

    volumesUse: {},
    volumesUseCnt: 0,

    volumeAttachment: {},
    volumeAttachmentCnt: 0,

    volumeClaimTemplates: {},
    volumeClaimTemplatesCnt: 0,

    volumeClaimTemplatesUse: {},
    volumeClaimTemplatesUseCnt: 0,

    volumeMounts: {},
    volumeMountsCnt: 0,

    volumeMountsUse: {},
    volumeMountsUseCnt: 0,

	//-------------------   User defined 

    kinds: {},
    kindStats: {},
    
    definedNamespaces: {
        'all-namespaces':'all-namespaces'
    },

    generic: {},
    genericCnt: 0,
      
    // counts of things parsed or processed
    containers: {},
    containerCnt: 0,
    iContainerCnt: 0,
    
    containerId: 1000,
    
    mntVol: [],
    mntCnt: 0,
    
    containerImage: {},
    containerImageCnt: 0,
    
    containerImageUse: {},
    containerImageUseCnt: 0,
    
    containerName: {},
    containerNameCnt: 0,

    ports: {},
    portsCnt: 0,

    nodeSelector: {},
    nodeSelectorCnt: 0,

    nodeSelectorUse: {},
    nodeSelectorUseCnt: 0,
    
    configMapUsage: {},
    secretUsage: {},
    fieldUsage: {},
    
    labels: {},
    labelsCnt: 0,
    
    labelsUse: {},
    labelsUseCnt: 0,
    
    labelsSpecTemplate: {},
    labelsSpecTemplateCnt: 0,
    
    labelsSpecSelector: {},
    labelsSpecSelectorCnt: 0,
    
    selectorLabels: {},
    selectorLabelsCnt: 0,
    
    vpkLogMsg: [],
    
    //last var/holder
    do_not_delete: 'do not delete'
};