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

Containers are only ever created within the context of a Pod. This is usually done using a 
Controller. See Controllers: Deployment, Job, or StatefulSet

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseContainer = function(ns, kind, name, obj, rCnt, src, part, ctype) {
    var doit = true;
    var e = -1;
    var c_name = '';
    var c_image = '';
    var c_command = '';
    var c_args = '';
    var c_key = '';
    var c_ids = [];
    var cmapRef;
    var secRef;
    var fldRef;
    var volMount;

    //var fld = getFileId(src);
    try {
        while (doit) {
            c_key = '';
            c_name = '';
            c_image = '';
            c_command = '';
            c_args = '';
            c_readinessProbe = '';
            c_livenessProbe = '';
            c_env = '';
            cmapRef = [];
            secRef = [];
            fldRef = [];
            volMount = [];

            e++;
            if (typeof obj[e] !== 'undefined') {
                //create and save internal used container id
                c_key = vpk.containerId++;
                c_ids.push(c_key);

                // parse contain definition
                c_name = obj[e].name;
                c_image = obj[e].image;
                
                // command array 
                if (typeof obj[e].command !== 'undefined') {
                    c_command = obj[e].command;
                	// build array with the container env info
	                var cmkey = ns + '.' + c_image;
    	            if (typeof vpk.command[cmkey] === 'undefined') {
        	            vpk.command[cmkey] = [];
            	    }
                	var tmpi = vpk.command[cmkey];
                	item = {
	                    'namespace': ns,
    	                'kind': kind,
        	            'objName': name,
            	        'command': 'Y',
                	    'image': c_image,
                    	'sourceFile': src,
	                    'sourcePart': part
    	            };
        	        tmpi.push(item);
            	    vpk.commandCnt++;
                	vpk.command[cmkey] = tmpi;
	                utl.checkKind('Command','U');
    	            utl.countKind('Command');

                }
                
                // args array
                if (typeof obj[e].args !== 'undefined') {
                    c_args = obj[e].args;
                	// build array with the container env info
	                var arkey = ns + '.' + c_image;
    	            if (typeof vpk.args[arkey] === 'undefined') {
        	            vpk.args[arkey] = [];
            	    }
                	var tmpi = vpk.args[arkey];
                	item = {
	                    'namespace': ns,
    	                'kind': kind,
        	            'objName': name,
            	        'args': 'Y',
                	    'image': c_image,
                    	'sourceFile': src,
	                    'sourcePart': part
    	            };
        	        tmpi.push(item);
            	    vpk.argsCnt++;
                	vpk.args[arkey] = tmpi;
	                utl.checkKind('Args','U');
    	            utl.countKind('Args');

                }

                // env
                if (typeof obj[e].env !== 'undefined') {
                    c_env = obj[e].env;
                	// build array with the container env info
	                var evkey = ns + '.' + c_image;
    	            if (typeof vpk.env[evkey] === 'undefined') {
        	            vpk.env[evkey] = [];
            	    }
                	var tmpi = vpk.env[evkey];
                	item = {
	                    'namespace': ns,
    	                'kind': kind,
        	            'objName': name,
            	        'env': 'Y',
                	    'image': c_image,
                    	'sourceFile': src,
	                    'sourcePart': part
    	            };
        	        tmpi.push(item);
            	    vpk.envCnt++;
                	vpk.env[evkey] = tmpi;
	                utl.checkKind('Env','U');
    	            utl.countKind('Env');
                }


                // readinessProbe array
                if (typeof obj[e].readinessProbe !== 'undefined') {
                    c_readinessProbe = obj[e].readinessProbe;
                	// build array with the container liveness info
	                var rikey = ns + '.' + c_image;
    	            if (typeof vpk.readinessProbe[rikey] === 'undefined') {
        	            vpk.readinessProbe[rikey] = [];
            	    }
                	var tmpi = vpk.readinessProbe[rikey];
                	item = {
	                    'namespace': ns,
    	                'kind': kind,
        	            'objName': name,
            	        'readinessProbe': 'Y',
                	    'image': c_image,
                    	'sourceFile': src,
	                    'sourcePart': part
    	            };
        	        tmpi.push(item);
            	    vpk.readinessProbeCnt++;
                	vpk.readinessProbe[rikey] = tmpi;
	                utl.checkKind('ReadinessProbe','U');
    	            utl.countKind('ReadinessProbe');
                }

                // livenessProbe array
                if (typeof obj[e].livenessProbe !== 'undefined') {
                    c_livenessProbe = obj[e].livenessProbe;
                	// build array with the container liveness info
	                var likey = ns + '.' + c_image;
    	            if (typeof vpk.livenessProbe[likey] === 'undefined') {
        	            vpk.livenessProbe[likey] = [];
            	    }
                	var tmpi = vpk.livenessProbe[likey];
                	item = {
	                    'namespace': ns,
    	                'kind': kind,
        	            'objName': name,
            	        'livenessProbe': 'Y',
                	    'image': c_image,
                    	'sourceFile': src,
	                    'sourcePart': part
    	            };
        	        tmpi.push(item);
            	    vpk.livenessProbeCnt++;
                	vpk.livenessProbe[likey] = tmpi;
	                utl.checkKind('LivenessProbe','U');
    	            utl.countKind('LivenessProbe');
                }



                // build entries if configMapKeyRef exists
                if (typeof obj[e].env !== 'undefined') {
                    var cfloop = true;
                    var c = 0;
                    if (typeof obj[e].env[c] == 'undefined') {
                        cfloop = false;
                    }

                    // build  configMap, secret, and fieldRef entries if they exist
                    while (cfloop) {
                        if (typeof obj[e].env[c].valueFrom !== 'undefined') {
//                            var vname = '';
                            var vkey = '';
                            var vdata = {};
                            vdata = {
                                'namespace': ns,
                                'kind': kind,
                                'objName': name
                            };
                            if (typeof obj[e].env[c].valueFrom.secretKeyRef !== 'undefined') {
                                vdata.type = 'secret';
                                vdata.vname = obj[e].env[c].valueFrom.secretKeyRef.name;
                                vdata.vkey = obj[e].env[c].valueFrom.secretKeyRef.key;
                                secRef.push(vdata);

                                // save info in use array
                                var seckey = ns + '.' + obj[e].env[c].valueFrom.secretKeyRef.name;
                                if (typeof vpk.secretsUse[seckey] === 'undefined') {
                                    vpk.secretsUse[seckey] = [];
                                }
                                var stmp = vpk.secretsUse[seckey];
                                var sUse = {
                                    'namespace': ns,
                                    'kind': kind,
                                    'objName': name,
                                    'secret': obj[e].env[c].valueFrom.secretKeyRef.name,
                                    'key': obj[e].env[c].valueFrom.secretKeyRef.key,
                                    'sourceFile': src,
                                    'sourcePart': part
                                };


                            	utl.checkKind('SecretUse','U');
                            	utl.countKind('SecretUse');

                                
                                stmp.push(sUse);
                                // stats counter 
                                vpk.secretsUseCnt++;
                                vpk.secretsUse[seckey] = stmp;
                            }
                            
                            
                            
                            if (typeof obj[e].env[c].valueFrom.configMapKeyRef !== 'undefined') {
                                vdata.type = 'configMap';
                                vdata.vname = obj[e].env[c].valueFrom.configMapKeyRef.name;
                                vdata.vkey = obj[e].env[c].valueFrom.configMapKeyRef.key;
                                cmapRef.push(vdata);

                                // save info in use array
                                var cfkey = ns + '.' + obj[e].env[c].valueFrom.configMapKeyRef.name;
                                if (typeof vpk.configMapUse[cfkey] === 'undefined') {
                                    vpk.configMapUse[cfkey] = [];
                                }
                                var ctmp = vpk.configMapUse[cfkey];
                                var cUse = {
                                    'namespace': ns,
                                    'kind': kind,
                                    'objName': name,
                                    'configMap': obj[e].env[c].valueFrom.configMapKeyRef.name,
                                    'key': obj[e].env[c].valueFrom.configMapKeyRef.key,
                                    'sourceFile': src,
                                    'sourcePart': part
                                };
                                
                                ctmp.push(cUse);
                                // stats counter 
                                vpk.configMapUseCnt++;
                                vpk.configMapUse[cfkey] = ctmp;
                            
                            
                            }
                            if (typeof obj[e].env[c].valueFrom.fieldRef !== 'undefined') {
                                vdata.type = 'fieldRef';
                                vdata.vname = obj[e].env[c].valueFrom.fieldRef.fieldPath;
                                fldRef.push(vdata);
                            }
                        }
                        c++;
                        if (typeof obj[e].env[c] === 'undefined') {
                            cfloop = false;
                        }
                    }
                }


                
                // check for volumeMounts
                if (typeof obj[e].volumeMounts !== 'undefined') {
                    var vloop = true;
                    var v = 0;
                    
                    if (typeof obj[e].volumeMounts[v] == 'undefined') {
                        vloop = false;
                    } 
                    
                    
                    // build  configMap, secret, and fieldRef entries if they exist
                    while (vloop) {
//                            var volname = '';
//                            var volpath = '';
                            var voldata = {};
                            var mountPath = '';
                            var mountName = '';
                            voldata = {
                                'namespace': ns,
                                'kind': kind,
                                'objName': name
                            };
                            if (typeof obj[e].volumeMounts[v].name !== 'undefined') {
                                mountName = obj[e].volumeMounts[v].name;
                                if (typeof obj[e].volumeMounts[v].name !== 'undefined') {
                                    mountPath = obj[e].volumeMounts[v].mountPath;
                                }
                            }
                            volMount.mountName = mountName;
                            volMount.mountPath = mountPath;
                            volMount.push(voldata);

                            // create / update volumeMounts
                            var vmkey = ns + '.' + 'VolumeMounts' + '.' + mountName;
                            if (typeof vpk.volumeMounts[vmkey] === 'undefined') {
                                vpk.volumeMounts[vmkey] = [];
                            
                                var tmpm = vpk.volumeMounts[vmkey];
                                var item = {
                                    'namespace': ns,
                                    'kind': 'VolumeMounts',
                                    'objName': mountName,
                                    'mountPath': mountPath,
                                    'mountName': mountName,
                                    'sourceFile': src,
                                    'sourcePart': part
                                };
                                tmpm.push(item);
                            
                                // stats counter 
                                vpk.volumeMountsCnt++;
                                vpk.volumeMounts[vmkey] = tmpm;
                            }
                            
                            utl.checkKind('VolumeMounts','U');
                            utl.countKind('VolumeMounts');


                            vmkey = ns + '.' + mountName;
                            if (typeof vpk.volumeMountsUse[vmkey] === 'undefined') {
                                vpk.volumeMountsUse[vmkey] = [];
                            }
                            var tmpv = vpk.volumeMountsUse[vmkey];
                            item = {
                                'namespace': ns,
                                'kind': kind,
                                'objName': name,
                                'sourceFile': src,
                                'sourcePart': part
                            };
                            tmpv.push(item);
                            
                            // stats counter 
                            vpk.volumeMountsUseCnt++;
                            vpk.volumeMountsUse[vmkey] = tmpv;

                            v++;
                            if (typeof obj[e].volumeMounts[v] === 'undefined') {
                                vloop = false;
                            }
                        //}
                    }
                }

                // build array with container defintion 
                if (typeof vpk.containers[c_key] === 'undefined') {
                    vpk.containers[c_key] = {
                        'namespace': ns,
                        'kind': kind,
                        'objName': name,
                        'containerName': c_name,
                        'image': c_image,
                        'env': c_env,
                        'command': c_command,
                        'args': c_args,
                        'liveness': c_livenessProbe,
                        'readiness': c_readinessProbe,
                        'replica': rCnt,
                        'secretKeyRef': secRef,
                        'configMapRef': cmapRef,
                        'fieldRef': fldRef,
                        'sourceFile': src,
                        'sourcePart': part
                    };

                    if (ctype === 'C') {
                        vpk.containerCnt++;
                    } else {
                        vpk.iContainerCnt++;
                    }
                } 

                // build array with the container name
                var ckey = ns + '.' + c_name;
                if (typeof vpk.containerName[ckey] === 'undefined') {
                    vpk.containerName[ckey] = [];
                }
                var tmpc = vpk.containerName[ckey];
                item = {
                    'namespace': ns,
                    'kind': kind,
                    'objName': name,
                    'containerRefName': c_name,
                    'image': c_image,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmpc.push(item);
                vpk.containerNameCnt++;
                vpk.containerName[ckey] = tmpc;
                utl.checkKind('ContainerName','U');
                utl.countKind('ContainerName');


                // build array with the docker container image name
                var cikey = ns + '.' + c_image;
                if (typeof vpk.containerImage[cikey] === 'undefined') {
                    vpk.containerImage[cikey] = [];
                }
                var tmpi = vpk.containerImage[cikey];
                item = {
                    'namespace': ns,
                    'kind': kind,
                    'objName': name,
                    'containerRefName': c_name,
                    'image': c_image,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmpi.push(item);
                vpk.containerImageCnt++;
                vpk.containerImage[cikey] = tmpi;
                utl.checkKind('ContainerImage','U');
                utl.countKind('ContainerImage');
                
                // xref container image
                var xkey = ns + '.' + c_image;
                if (typeof vpk.containerImageUse[xkey] === 'undefined') {
                    vpk.containerImageUse[xkey] = [];
                }
                var tmpu = vpk.containerImageUse[xkey];
                item = {
                    'namespace': ns,
                    'kind': kind,
                    'objName': name,
                    'containerRefName': c_name,
                    'image': c_image,
                    'sourceFile': src,
                    'sourcePart': part
                };
                tmpu.push(item);
                vpk.containerImageUseCnt++;
                vpk.containerImageUse[xkey] = tmpu;

            } else {
                doit = false;
            }

            // safety stop
            if (e > 100) {
                doit = false;
            }
        }

    } catch (err) {
        utl.logMsg('vpkCNT001 - Error processing file: ' + src + ' part: ' + part + ' container entry: ' + c_name + ' message: ' + err, 'containerParse');
    }

    return c_ids;

};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    parse: function(ns, kind, name, obj, rCnt, src, part, containerType) {

        parseContainer(ns, kind, name, obj, rCnt, src, part, containerType);

    }

};