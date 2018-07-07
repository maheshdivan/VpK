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

*/
//------------------------------------------------------------------------------
// Software version
//------------------------------------------------------------------------------
var softwareVersion = '2.2.0';

//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
var vpk = require('./lib/vpk');
var utl = require('./lib/utl');
var vpkReset = require('./lib/vpkReset');
var fileio = require('./lib/fileio');
var search = require('./lib/search');
var gensvg = require('./lib/svgGenDrv');
var kube = require('./lib/kube');
var fs = require('fs-extra');
var express = require('express');
var Q = require('q');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var YAML = require('js-yaml');
var commandLineArgs = require('command-line-args');
var commandLineUsage = require('command-line-usage');
var chalk = require('chalk');
var multer = require('multer');
var path = require('path');
var compression = require('compression');
var cors = require('cors');


//------------------------------------------------------------------------------
// Application variables
//------------------------------------------------------------------------------
var dest = './uploads'
var zips = [];
var targz = [];

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, dest)
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
        var ext = path.extname(file.originalname).toUpperCase();
        if (ext === '.ZIP') {
            zips.push(file.originalname);
        }
        if (ext === '.GZ') {
            targz.push(file.originalname);
        }
        if (ext === '.TAR') {
            targz.push(file.originalname);
        }
    }
});

var resetReq = false;
var statMessages;
var dashline = '---------------------------------';
var validDir = true;
var port = 4200;
var options;
var optionDefinitions = [{
        name: 'directory',
        alias: 'd',
        type: String
    },
    {
        name: 'port',
        alias: 'p',
        type: Number,
        defaultOption: 4200
    },
    {
        name: 'help',
        alias: 'h'
    }
];

var bb = chalk.green;
var VPK_TITLE = chalk.bold.underline('Visual parsed Kubernetes' );
var VPK_VERSION = chalk.bold.underline('Version: ' + softwareVersion );

// Do not change the spacing of the following VPK_HEADER, and 
// do not delete the single tick mark
var VPK_HEADER = `
${bb('-----------------------------------------------------------------')}
 ${''}              
  ${bb('\\˜˜\\')}        ${bb('/˜˜/')}        ${bb('|˜˜|  /˜˜/')}   ${bb(VPK_TITLE)}
   ${bb('\\  \\')}      ${bb('/  /')}         ${bb('|  | /  /')}    ${bb(VPK_VERSION)}                  
    ${bb('\\  \\')}    ${bb('/  /')}          ${bb('|  |/  /')} 
     ${bb('\\  \\')}  ${bb('/  /')}           ${bb('|      \\')}
      ${bb('\\  \\')}${bb('/  /')}   ${bb('||˜˜˜\\\\')}  ${bb('|  |˜\\  \\')}
       ${bb('\\')}${bb('    /')}    ${bb('||   ||')}  ${bb('|  |  \\  \\')} 
        ${bb('\\')}${bb('__/')}     ${bb('||___//')}  ${bb('|__|   \\__\\')}
                 ${bb('||')}
                 ${bb('||')}
${bb('-----------------------------------------------------------------')}              
  `
//Do not delete the single tick mark above

// reset all vars that are used for parsing
vpkReset.resetAll();

//------------------------------------------------------------------------------
// process start parameters if provided
//------------------------------------------------------------------------------
options = commandLineArgs(optionDefinitions)

// -help used
if (typeof options.help !== 'undefined') {
    help();
    process.exit(0);
}

// -d used
if (typeof options.directory !== 'undefined' && options.directory !== null) {
    var val = options.directory;
    if (fs.existsSync(val)) {
        utl.logMsg('vpkMNL001 - Process directory defined at start: ' + val, 'server');
        vpk.dirFS.push(val);
        vpk.startDir = val;
        validDir = true;
    } else {
        utl.logMsg('vpkMNL002 - Not valid directory: ' + val, 'server');
        validDir = false;
    }
}

// -p used
if (typeof options.port !== 'undefined' && options.port !== null) {
    port = options.port;
    if (port < 1 || port > 65535) {
        utl.logMsg('vpkMNL099 - Invalid port number defined.  Valid range is 1 - 65535.', 'server');
        process.exit(-1);
    }
}

// create the 'cluster' directory 
makedir('cluster');


//------------------------------------------------------------------------------
// Define express routes / urls
//------------------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Express app definitions
app.use(compression());
app.use(cors());

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});


app.get('/ping', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('VPK server is OK\n');
});


app.post('/upload', function(req, res) {

    var upload = multer({
        storage: storage
    }).array('file', 4);

    upload(req, res, function(err) {
        if (err) {
            utl.logMsg('vpkMNL022 - Error processing upload, message: ' + err, 'server');
            return res.status(422);
        }

        // untar files
        if (targz.length > 0) {
            for (gz in targz) {
                if (targz[gz] !== null) {
                    utl.logMsg('vpkMNL020 - UnTar file: ' + targz[gz], 'server');
                    utl.untar(targz[gz], dest)
                    targz[gz] = null;
                }
            }
        }

        // unzip files
        if (zips.length > 0) {
            for (zp in zips) {
                if (zips[zp] !== null) {
                    utl.logMsg('vpkMNL021 - UnZip file: ' + zips[zp], 'server');
                    utl.unzip(zips[zp], dest)
                    zips[zp] = null;
                }
            }
        }

        res.end("File(s) processed");
    });
});


//------------------------------------------------------------------------------
// Define SocketIO 
//------------------------------------------------------------------------------
io.on('connection', function(client) {

    client.on('clearLog', function() {
        utl.logMsg('vpkMNL015 - Clear logs request', 'server');
        vpk.vpkLogMsg = [];
        client.emit('logsCleared');
    });

    client.on('dynamic', function(data) {
        utl.logMsg('vpkMNL699 - Dynamic request', 'server');

        var dynDir = process.cwd();
        dynDir = dynDir + '/cluster/' + data.ip;

        var rdata = {};
        var rtn = '';
        kube.getAuthToken(data)
            .then(function(result) {
                if (result.startsWith('FAIL') || result.startsWith('Fail')) {
                    utl.logMsg('vpkMNL600 - Failed: Result: ' + result);
                    rdata.status = 'FAIL';
                    rdata.message = result;
                } else {
                    utl.logMsg('vpkMNL601 - Get namespace success', 'server');
                    // add auth token and directory to data object
                    data.kubetoken = result;

                    kube.authenticateSession(data)
                    rtn = kube.getKubeInfo(data);

                    //	write files to directory
                    //var yf = JSON.parse(rtn);
                    var yf = rtn;
                    rtn = '';
                    var fbase = 'config';
                    var fnum = 1000;
                    var fn;
                    var input;

                    rdata.status = 'PASS';
                    rdata.message = 'OK';

                    remdir(dynDir)
                        .then(function() {
                            makedir(dynDir)
                                .then(function(mkresult) {
                                    try {
                                        if (mkresult === 'PASS') {

                                            for (var i = 0; i < yf.items.length; i++) {
                                                input = yf.items[i];
                                                input = JSON.stringify(input, null, 4);
                                                fnum++;
                                                fn = dynDir + '/' + fbase + fnum + '.yaml';
                                                fs.writeFileSync(fn, input);
                                                //utl.logMsg('vpkMNL606 - Created yaml file: ' + fn, 'server');
                                            }

                                            // load newly created files
                                            reload(dynDir);

                                            var result = {
                                                'baseDir': dynDir,
                                                'validDir': true
                                            };
                                            client.emit('resetResults', result);
                                            
									        var result = {
									            'kinds': vpk.kinds,
									            'namespaces': vpk.definedNamespaces,
									            'baseDir': vpk.startDir,
									            'validDir': validDir
									        };
        									client.emit('selectListsResult', result);
                                            
                                        }
                                    } catch (err) {
                                        utl.logMsg('vpkMNL605 - Unable to cretae directory: ' + dynDir + ' message: ' + err, 'server');
                                        rdata.status = 'FAIL';
                                        rdata.message = 'vpkMNL605 - Unable to cretae directory: ' + dynDir + ' message: ' + err;
                                    }
                                })
                                .catch(function(err) {
                                    utl.logMsg('vpkMNL602 - Processing error, message: ' + err, 'server');
                                    rdata.status = 'FAIL';
                                    rdata.message = 'vpkMNL602 - Processing error, message: ' + err;
                                });
                        })
                        .catch(function(err) {
                            utl.logMsg('vpkMNL604 - Processing error, message: ' + err, 'server');
                            rdata.status = 'FAIL';
                            rdata.message = 'vpkMNL604 - Processing error, message: ' + err;
                        });
                }
    		    client.emit('dynamicResults', rdata);

            })
            .catch(function(err) {
                utl.logMsg('vpkMNL603 - Processing error, message: ' + err, 'server');
                rdata.status = 'FAIL';
                rdata.message = 'vpkMNL603 - Processing error, message: ' + err;
				console.log(JSON.stringify(rdata, null, 4))
        		client.emit('dynamicResults', rdata);
            });
    });


    client.on('getDef', function(data) {
        // save the key for use when results are returned
        var parts = data.split('::');
        var defkey = parts[2];
        data = parts[0] + '::' + parts[1];

        utl.logMsg('vpkMNL003 - Get object definition from file: ' + parts[0] + ' part: ' + parts[1], 'server');
        try {
            var rtn = '';
            var part = data.split('::');
            rtn = YAML.safeDump(vpk.fileContent[data]);
            var result = {
                'filePart': part[1],
                'lines': rtn,
                'defkey': defkey
            };
            client.emit('objectDef', result);
        } catch (err) {
            utl.logMsg('vpkMNL004 - Error processing getDef, message: ' + err, 'server');
        }
    });

    client.on('getDirStats', function() {
        utl.logMsg('vpkMNL006 - DirStats request', 'server');
        client.emit('dirStatsResult', statMessages);
    });

    client.on('getLog', function() {
        utl.logMsg('vpkMNL018 - Get logs', 'server');
        var result = {
            'logs': vpk.vpkLogMsg
        };
        client.emit('logResult', result);
    });

    client.on('getSelectLists', function() {
        utl.logMsg('vpkMNL008 - Get select lists request', 'server');
        var result = {
            'kinds': vpk.kinds,
            'namespaces': vpk.definedNamespaces,
            'baseDir': vpk.startDir,
            'validDir': validDir
        };
        client.emit('selectListsResult', result);
    });

    client.on('getSvg', function(data) {
        utl.logMsg('vpkMNL007 - Build SVG request ' + data, 'server');
        var result = gensvg.build(data);
        client.emit('svgResult', result);
    });


    client.on('getVersion', function(data) {
        utl.logMsg('vpkMNL091 - Get software version request ', 'server');
        var result = {'version': softwareVersion};
        client.emit('version', result);
    });


    client.on('reload', function(data) {
        utl.logMsg('vpkMNL009 - Load directory: ' + data, 'server');
        reload(data);
        setTimeout(function() {
            var result = {
                'kinds': vpk.kinds,
                'namespaces': vpk.definedNamespaces,
                'baseDir': vpk.startDir,
                'validDir': validDir
            };
            utl.logMsg('vpkMNL010 - Reset completed after 2 second wait', 'server');
            client.emit('selectListsResult', result);

            result = {
                'baseDir': vpk.startDir,
                'validDir': validDir
            };
            client.emit('resetResults', result);

            resetReq = false;
        }, 2000);
    });

    client.on('search', function(data) {
        utl.logMsg('vpkMNL005 - Search for ' + data.searchType + ' in ' + data.namespaceFilter, 'server');
        var result = search.process(data);
        client.emit('searchResult', result);
    });


    client.on('uploadDir', function(data) {
        utl.logMsg('vpkMNL045 - Upload directory request', 'server');
        var result = uploadDir(data);
        client.emit('uploadDirResult', result);
    });


});


/**
 * Create the target directory for file uploads.   quite wonderful function.
 * @param {string} - [dir] Directory name
 * @returns {Object} A JSON object with fields status: (PASS or FAIL), dir: directory, msg: error message if create 
 */
function uploadDir(dir) {
    // clear or reset existing vars	
    zips = [];
    targz = [];

    var currentDir = process.cwd();
    var rtn;
    var status = 'PASS';
    if (dir.startsWith('./')) {
        dir = currentDir + '/' + dir.substring(2)
    }

    // determine if directory already exist and/or create directory
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            rtn = 'Created directory: ' + dir;
        } else {
            rtn = 'Directory: ' + dir + ' already exists';
        }
        // set the file upload directory
        dest = dir;

    } catch (e) {
        rtn = e.message;
        status = 'FAIL';
    }

    // return JSON object with results
    utl.logMsg('vpkMNL019 - ' + rtn, 'server');
    var data = {
        'status': status,
        'dir': dir,
        'msg': rtn
    };

    return data;
}


function reload(dir) {
    // if valid directory process
    if (fs.existsSync(dir)) {
        resetReq = true;
        vpkReset.resetAll();
        vpk.dirFS.push(dir);
        vpk.startDir = dir;
        utl.logMsg('vpkMNL011 - Reset to new directory: ' + vpk.startDir, 'server');
        validDir = true;
        checkLoop();
    } else {
        vpk.startDir = dir;
        validDir = false;
        statMessages = [];
        statMessages.push('vpkMNL012 - Invalid directory, no stats returned', 'server');
    }
}


function createFiles(data) {
    if (dynamicDir()) {
        var yf = JSON.parse(data);
        var fbase = 'config';
        var fnum = 100;
        var fn;
        var dynDir = process.cwd();
        dynDir = dynDir + '/cluster';
        var input;

        for (var i = 0; i < yf.items.length; i++) {
            input = yf.items[i];
            fnum++;
            fn = dynDir + '/' + fbase + fnum;
            fs.writeFileSync(fn, input);
            utl.logMsg('vpkMNL055 - Created file: ' + fn, 'server');
        }
        // load newly created files
        reload(data);

        var result = {
            'baseDir': dynDir,
            'validDir': true
        };
        client.emit('resetResults', result);


    } else {

    }
}


function makedir(dir) {
    var deferred = Q.defer();

    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            utl.logMsg('vpkMNL158 - Created directory: ' + dir, 'server');
        } else {
            utl.logMsg('vpkMNL157 - Directory already exists: ' + dir, 'server');
        }
        deferred.resolve('PASS');
    } catch (e) {
        deferred.resolve('FAIL');
    }
    return deferred.promise;
}


function remdir(dir) {
    var deferred = Q.defer();
    try {
        fs.remove(dir, err => {
            if (err) {
                utl.logMsg('vpkMNL156 - Failed to delete directory: ' + dir + ' message: ' + err);
                deferred.resolve('FAIL');
            } else {
                fs.mkdirSync(dir);
                utl.logMsg('vpkICP159 - Cleared directory: ' + dir, 'server');
                deferred.resolve('PASS');
            }
        });
    } catch (err) {
        utl.logMsg('vpkMNL155 - Unable to delete resource: ' + dir, 'server');
        deferred.resolve('FAIL');
    }

    return deferred.promise;
}


//------------------------------------------------------------------------------
// check if processing should continue
//------------------------------------------------------------------------------
function checkLoop() {
    statMessages = [];

    if (!validDir) {
        startServer();
        return;
    }

    if (vpk.loop) {
        fileio.checkDir();
        checkAgain();
    } else {
        saveStatMsg('dl', 0);
        saveStatMsg('Dirs read                  ', vpk.dCnt);
        saveStatMsg('Files read                 ', vpk.fCnt);
        saveStatMsg('Kube YAML                  ', vpk.yCnt);
        saveStatMsg('Skipped                    ', vpk.xCnt);
        saveStatMsg('dl', 0);
        saveStatMsg('Search arrays built', ' ');
        saveStatMsg('dl', 0);
        saveStatMsg('APIService                 ', vpk.apiServiceCnt);
        saveStatMsg('CertificateSigningRequest  ', vpk.certificateSigningRequestCnt)
        saveStatMsg('ClusterRoleBinding         ', vpk.clusterRoleBindingCnt);
        saveStatMsg('ClusterRoles               ', vpk.clusterRoleCnt);
        saveStatMsg('ComponentStatuses          ', vpk.componentStatusesCnt);
        saveStatMsg('ConfigMaps                 ', vpk.configMapCnt);
        saveStatMsg('Containers                 ', vpk.containerCnt);
        saveStatMsg('ControllerRevisions        ', vpk.controllerRevisionsCnt);
        saveStatMsg('CronJobs                   ', vpk.cronJobCnt);
        saveStatMsg('CustomResourceDefinitions  ', vpk.customResourceDefinitionsCnt);
        saveStatMsg('DaemonSets                 ', vpk.daemonSetCnt);
        saveStatMsg('Deployments                ', vpk.deploymentsCnt);
        saveStatMsg('Endpoints                  ', vpk.endpointsCnt);
        saveStatMsg('Ingress                    ', vpk.ingressCnt);
        saveStatMsg('Jobs                       ', vpk.jobsCnt);
        saveStatMsg('LimitRanges                ', vpk.limitRangeCnt);
        saveStatMsg('Lists                      ', vpk.listsCnt);
        saveStatMsg('Namespaces                 ', vpk.namespacesCnt);
        saveStatMsg('PersistentVolumeClaims     ', vpk.persistentVolumeClaimCnt);
        saveStatMsg('PersistentVolumes          ', vpk.persistentVolumeCnt);
        saveStatMsg('PodDisruptionBudgets       ', vpk.podDisruptionBudgetCnt);
        saveStatMsg('Pods                       ', vpk.podCnt);
        saveStatMsg('PodSecurityPolicies        ', vpk.podSecurityPolicyCnt);
        saveStatMsg('ReplicaSets                ', vpk.replicaSetCnt);
        saveStatMsg('ReplicationControllers     ', vpk.replicationControllerCnt);
        saveStatMsg('RoleBindings               ', vpk.roleBindingCnt);
        saveStatMsg('Roles                      ', vpk.roleCnt);
        saveStatMsg('Secrets                    ', vpk.secretsCnt);
        saveStatMsg('ServiceAccount             ', vpk.serviceAccountCnt);
        saveStatMsg('Services                   ', vpk.servicesCnt);
        saveStatMsg('StatefulSets               ', vpk.statefulSetsCnt);
        saveStatMsg('StorageClasses             ', vpk.storageClassCnt);
        saveStatMsg('dl', 0);
        saveStatMsg('Args                       ', vpk.argsCnt);
        saveStatMsg('Command                    ', vpk.commandCnt);
        saveStatMsg('ContainerName              ', vpk.containerNameCnt);
        saveStatMsg('ContainerImage             ', vpk.containerImageCnt);
        saveStatMsg('Env                        ', vpk.envCnt);
        saveStatMsg('InitContainer              ', vpk.iContainerCnt);
        saveStatMsg('Labels                     ', vpk.labelsCnt);
        saveStatMsg('Labels (specTemplate)      ', vpk.labelsSpecTemplateCnt);
        saveStatMsg('Labels (specSelector)      ', vpk.labelsSpecSelectorCnt);
        saveStatMsg('LivenessProbe              ', vpk.livenessProbeCnt);
        saveStatMsg('NodeSelector               ', vpk.nodeSelectorCnt);
        saveStatMsg('ReadinessProbe             ', vpk.readinessProbeCnt);
        saveStatMsg('Selector (labels)          ', vpk.selectorLabelsCnt);
        saveStatMsg('VolumeAttachment           ', vpk.volumeAttachmentCnt);
        saveStatMsg('VolumeMount                ', vpk.volumeMountsCnt);
        saveStatMsg('VolumeClaimTemplates       ', vpk.volumeClaimTemplatesCnt);
        saveStatMsg('Volumes                    ', vpk.volumesCnt);
        saveStatMsg('DockerContainerNames       ', vpk.containerImageCnt);
        saveStatMsg('ConfigMapUse               ', vpk.configMapUseCnt);
        saveStatMsg('SecretUse                  ', vpk.secretsUseCnt);
        saveStatMsg('dl', 0);

        //console.log(JSON.stringify(vpk.services, null, 2))

        // After reading and parsing of files start server
        if (resetReq) {
            resetReq = false;
        } else {
            startServer();
        }
    }
}

function saveStatMsg(msg, cnt) {
    if (msg === 'dl') {
        utl.logMsg(dashline, 'server');
    } else {
        utl.logMsg(msg + '\t' + cnt, 'server');
        statMessages.push(msg + '::' + cnt);
    }
}

//------------------------------------------------------------------------------
// check if still processing
//------------------------------------------------------------------------------
function checkAgain() {
    checkLoop();
}

function startServer() {
    splash();
    utl.logMsg('vpkMNL014 - VpK Server started, port: ' + port, 'server');
    server.listen(port);
}

function help() {
    var usage = commandLineUsage([{
            content: VPK_HEADER,
            raw: true,
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]);
    console.log(usage);
}

function splash() {
    var adv = commandLineUsage([{
        content: VPK_HEADER,
        raw: true,
    }]);
    console.log(adv);
}

//begin processing
checkLoop();