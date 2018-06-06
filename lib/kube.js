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
/*----------------------------------------------------------

Processes and functions for communicting with kubernetes via kubectl

*/
var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var Q = require('q');
var supertest = require('supertest-as-promised');

//------------------------------------------------------------------------------
// authorize user and get token for following processing 
var getToken = function(url, username, password, callback) {

    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        var headers = {
            'Authorization': 'Basic Y2Y6',
            'Content-Type': 'application/x-www-form-urlencoded',
            'charset': 'UTF-8',
            'Accept-Language': 'en'
        };
        var payload = {};
        payload = "grant_type=password&username=" + username + "&password=" + password + "&scope=openid email profile";
        supertest(url)
            .post('/idprovider/v1/auth/identitytoken')
            .set(headers)
            .send(payload)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    utl.logMsg('vpkKUB053 - GetToken failed to authorize user, message: ' + err, 'kube');
                    return callback('NO_AUTH');
                } else {
                    utl.logMsg('vpkKUB054 - GetToken succeeded for authorized user.', 'kube');
                    return callback(res);
                }
            })

    } catch (err) {
        utl.logMsg('vpkKUB064 - GetToken internal error, message: ' + err, 'kube');
        return callback('NO_AUTH');
    }


};

var kubeget = function(ns, kind) {
    var execSync = require('child_process').execSync;
    try {
        var cmd = '';
        if (ns === 'all-namespaces') {
            cmd = 'kubectl --all-namespaces -o json get ' + kind;
        } else {
            cmd = 'kubectl -n ' + ns + ' -o json get ' + kind;
        }
        var out = execSync(cmd).toString();
        var hl = out.length;
        utl.logMsg('vpkKUB070 - Namespace: ' + ns + ' Kind: ' + kind + ' Bytes of data: ' + hl, 'kube') 
        return out;
    } catch (err) {
        utl.logMsg('vpkKUB071 - Error getting information for namespace: ' + namespace + '  Message: ' + err, 'kube');
        return '{"items":[]}';
    }
};


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // check if namespace is in array 
    //------------------------------------------------------------------------------

    // get auth token
    getAuthToken: function(icp) {
        var deferred = Q.defer();

        // console.log(JSON.stringify(icp, null, 4));
        // extract variables from icp object
        var url = icp.url;
        var username = icp.username;
        var password = icp.pswd;

        utl.logMsg('vpkKUB150 - Get auth token', 'server');
        // Authenticate and get tokens
        var kubeToken = '';
        var authResult;


        getToken(url, username, password, function(res) {
            if (typeof res.text !== 'undefined') {

                authResult = JSON.parse(res.text)
                kubeToken = authResult.id_token;

                if (kubeToken.length > 10) {
                    utl.logMsg('vpkKUB151 - Obtained authorization token', 'kube');
                    deferred.resolve(kubeToken);
                } else {
                    utl.logMsg('vpkKUB157 - Auth Token not valid', 'kube');
                    deferred.resolve('Failed: vpkKUB157 - AuthToken invalid.');
                }
            } else {
                utl.logMsg('vpkKUB158 - Auth Token not valid', 'kube');
                deferred.resolve('Failed: vpkKUB157 - AuthToken invalid.');

            }
        });
        return deferred.promise;
    },


    // create the kubectl commands to authenticate session and set context.  Context is set using the username defined in the config.json file.
    authenticateSession: function(icp) {

        /* ---------- structure for icp
    	icp = {
        	"username": user,
        	"pswd" : pswd,
        	"url"     : url,
        	"clustername": name,
        	"kubeurl" : kurl,
        	"namespace": ns,
        	"ip": ip,
        	"kubetoken": token
		}        
    
    	// ----------- example kubectl commands
    
    	kubectl config set-cluster mycluster.icp --server=https://169.53.48.99:8001 --insecure-skip-tls-verify=true
		kubectl config set-context mycluster.icp-context --cluster=mycluster.icp
		kubectl config set-credentials admin --token=eyJ0eXAiXNc3N2QxMWZmM . . .
		kubectl config set-context mycluster.icp-context --user=admin --namespace=default
		kubectl config use-context mycluster.icp-context
    
    	*/

        var cmd1 = 'kubectl config set-cluster ' + icp.clustername + ' --server=' + icp.kubeurl + ' --insecure-skip-tls-verify=true';
        var cmd2 = 'kubectl config set-context ' + icp.clustername + '-context --cluster=' + icp.clustername;
        var cmd3 = 'kubectl config set-credentials ' + icp.username + ' --token=' + icp.kubetoken;
        var cmd4 = 'kubectl config set-context ' + icp.clustername + '-context --user=' + icp.username + ' --namespace=' + icp.ns;
        var cmd5 = 'kubectl config use-context ' + icp.clustername + '-context';

        var execSync = require('child_process').execSync;
        var allOK = true;
        try {
            var out = '';
            out = execSync(cmd1).toString();
            // Cluster "mycluster.icp" set.
            if (out.startsWith('Cluster ')) {
                if (out.endsWith(' set.\n')) {
                    // do nothing
                } else {
                    allOK = false;
                }
            } else {
                allOK = false;
            }

            out = execSync(cmd2).toString();
            // Context "mycluster.icp-context" modified.
            if (out.startsWith('Context ')) {
                if (out.endsWith(' modified.\n')) {
                    // do nothing
                } else {
                    allOK = false;
                }
            } else {
                allOK = false;
            }

            out = execSync(cmd3).toString();
            // User "admin" set.
            if (out.startsWith('User ')) {
                if (out.endsWith(' set.\n')) {
                    // do nothing
                } else {
                    allOK = false;
                }
            } else {
                allOK = false;
            }

            out = execSync(cmd4).toString();
            // Context "mycluster.icp-context" modified.
            if (out.startsWith('Context ')) {
                if (out.endsWith(' modified.\n')) {
                    // do nothing
                } else {
                    allOK = false;
                }
            } else {
                allOK = false;
            }

            out = execSync(cmd5).toString();
            // Switched to context "mycluster.icp-context".
            if (out.startsWith('Switched ')) {
                if (out.endsWith('-context".\n')) {
                    // do nothing
                } else {
                    allOK = false;
                }
            } else {
                allOK = false;
            }
            return allOK;

        } catch (err) {
            utl.logMsg('vpkKUB002 - Error setting kubectl environment, message: ' + err, 'kube');
            return false;
        }
    },


    // get all data for supplied namespace 
    getKubeInfo: function(icp) {

        //    "cronjobs" and "podpreset" removed because it errors

        var kga = [
            "apiservice",
            "certificatesigningrequests",
            "clusterrolebindings",
            "clusterroles",
            "configmaps",
            "controllerrevisions",
            "componentstatuses",
            "customresourcedefinition",
            "daemonsets",
            "deployments",
            "endpoints",
            "events",
            "horizontalpodautoscalers",
            "ingresses",
            "jobs",
            "limitranges",
            "namespaces",
            "networkpolicies",
            "nodes",
            "persistentvolumeclaims",
            "persistentvolumes",
            "poddisruptionbudgets",
            "pods",
            "podsecuritypolicies",
            "podtemplates",
            "replicasets",
            "replicationcontrollers",
            "resourcequotas",
            "rolebindings",
            "roles",
            "secrets",
            "serviceaccount",
            "services",
            "statefulsets",
            "storageclasses"
        ]

        var namespace = icp.ns;
		var rtn = {"items": []};
		var yf;
		var item;
		var it;
        if (namespace === null || namespace === '' || namespace.length < 3) {
            utl.logMsg('vpkKUB009 - Invalid or missing namespace value: ' + namespace, 'kube');
            return 'FAIL';
        } else {
        	var kl = kga.length
        	var data = '';
        	for (var k = 0; k < kl; k++) {
        		data = kubeget(namespace, kga[k])
        		if (data.length > 0) {
        			if (data.length === 143) {
        				continue;
        			}
        			if (data.endsWith('}\n') ) {
						if (data.startsWith('{')) {
							yf = JSON.parse(data);
						    for (it = 0; it < yf.items.length; it++) {
                                item = yf.items[it];
                                rtn.items.push(item);
                            }
                            utl.logMsg('vpkKUB014 - Count: ' + it + ' - '+ kga[k], 'kube');
        				} else {
        					utl.logMsg('vpkKUB011 - Not valid JSON start', 'kube');
        				}
        			} else {
        				utl.logMsg('vpkKUB011 - Not JSON: ' + data, 'kube');
        			}
        		}
        	}        	
        	return rtn;
        }
    }

    //end of export    
};