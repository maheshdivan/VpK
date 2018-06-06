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

//----------------------------------------------------------
// build svg data from returned data
//----------------------------------------------------------
function svgResult(data) {
    //console.log(JSON.stringify(data));
    var sbase = ' ';
    var tmp = ' ';
    var ns;
    var newsvg;
	var kind;
    for (var e = 0; e < data.length; e++) {
		kind = data[e].kind;

    	if (data[e].evt === 'endNamespace') {
    	    // get svg header info and trim 30 pixels from bottom
    	    var ht = data[e].y;
    	    ht = ht - 30;
    		sbase = sbase + writeSVGHeader(1080, ht , ns); 

    		// add the svg info
    		sbase = sbase + tmp;
    		tmp = ' ';
    		// close the svg 
    		sbase = sbase + '</svg>';
    	}

    	if (data[e].evt === 'startNamespace') {
    		// save the namespace
    		ns = data[e].ns; 
    	}

    	if (data[e].evt === 'circle') {
    		// draw circle, using h variable for radius
    		newsvg = writeCircle(data[e].x, data[e].y, data[e].h); 
    		tmp = tmp + newsvg;    	
    	}

    	if (data[e].evt === 'text') {
    		// draw circle, using h variable for radius
    		newsvg = writeText(data[e].x, data[e].y, data[e].name); 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'entry') {
			// draw rectangle
    		newsvg = writeBox(data[e].x, data[e].y, data[e].h, data[e].w, data[e].kind, data[e].src, data[e].part, data[e].name ) 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'boundary') {
			// draw dashed boundary box
    		newsvg = writeBoundary(data[e].x, data[e].y, data[e].h, data[e].w, data[e].kind, data[e].src, data[e].part, data[e].name ) 
    		tmp = tmp + newsvg;
    	}

    	if (data[e].evt === 'line') {
    		// draw line
    		newsvg = writeLine(data[e].x, data[e].y, data[e].h, data[e].w) 
    		tmp = tmp + newsvg;
    	}

    }
    $("#svgResults").empty();
    $("#svgResults").html('');
    
    //console.log(sbase);

    $("#svgResults").html(sbase);
}


function writeSVGHeader(w, h, ns) {
    var hdr1 =  '<svg xmlns="http://www.w3.org/2000/svg" width="';
    var hdr2 = '" height="';
    var hdr3 = '"><g><title>';
	var hdr4 = '</title><rect fill="#ccc" id="canvas_background" height="'
	var hdr4b = '" width="1080" y="-1" x="-1"/>' 
	var hdr5 = '<text x="5.0"  y="15.0"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="14" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000">' 
    var hdr6 = '</text><g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">' +
               '<rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/></g></g>';

	h = h + 30;
	if (ns === 'CLUSTER') {
		ns = 'none - cluster level definition';
	}
	return hdr1 + w + hdr2 + h + hdr3 + 'NAMESPACE: ' + ns + hdr4 + h + hdr4b +hdr5 + 'NAMESPACE: ' + ns + hdr6;
}

function writeText(x, y, text) {
	var txt1 = '<text x="';
	var txt2 = '"  y="';
	var txt3 = '"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="12" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000">' 
    var txt4 = '</text>';

	return txt1 + x + txt2 + y + txt3 + text + txt4; 
}

function writeLine(x1, y1, x2, y2) {
	var line1 = '<line stroke-linecap="square" stroke-linejoin="miter" x1="'; 
	var line2 = '"  y1="';
	var line3 = '"  x2="';
	var line4 = '"  y2="';
	var line5 = '"  stroke-width="1.0" stroke="#000" fill="none"/>';
	
	return line1 + x1 + line2 + y1 + line3 + x2 + line4 + y2 + line5;
}

function writeCircle(x, y, r) {
	var cir1 = '<circle cx="';
	var cir2 = '" cy="';
	var cir3 = '" r="';
	var cir4 = '" style="fill: #fff; stroke: #fff; stroke-width: 0.5px;" />';
	
	return cir1 + x + cir2 + y + cir3 + r + cir4;
}

function writeBox(x, y, h, w, kind, src, part, objname) {
	svgE++;	
	var sq = "'";
	var data;
	var color;
	var name;
    var ent1 = '<g><g id="svge';
    var ent2 = '" onclick="getDef(';
    var ent3 = ')"><title>';         // source file name  
    var ent4 = '</title><rect x="';        // x cord
    var ent5 = '"  y="';                   // y cord
    var ent6 = '"  height="';              // heigth
    var ent7 = '" width="';                // width
    var ent8 = '" fill="#';                //color
    var ent9 = '" stroke="#000000" stroke-width="0.5"  rx="6" ry="6" /><text x="'
	var ent10 = '"  y="'
	var ent11 = '"  xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="12" ' +
                      'fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#fff" fill="#fff">';
	var ent12 = '</text></g></g>';

	data = setData(kind); 
	color = data[0];
	if (data.length > 1) {
		name = data[1];
	} else {
		name = kind;
	}
	var tx = x + 3;
	var ty = y + 20;

	return ent1 + svgE + ent2 + sq + src + '::' + part + '::' + objname + sq + ent3 + objname + ent4 + x + ent5 + y + ent6 + h + ent7 + w + ent8 + color + ent9 + tx + ent10 + ty + ent11 + name + ent12;

}

function writeBoundary(x, y, h, w, kind, src, part, objname) {
    var ent1 = '<g><rect x="';        // x cord
    var ent2 = '"  y="';                   // y cord
    var ent3 = '"  height="';              // heigth
    var ent4 = '" width="';                // width
    var ent5 = '" fill=none stroke="#000000" stroke-width="0.5" stroke-dasharray="3, 3" rx="6" ry="6" /></g>';

	return ent1 + x + ent2 + y + ent3 + h + ent4 + w + ent5;

}


//set color and display name truncated to fit display block 
function setData(type) {
        // find and filter
        var data = [];
        switch (type) {
            case 'APIService':
                data.push('330033');
                break;
            case 'CertificateSigningRequest':
                data.push('003399');
                data.push('Cert\'Sign\'Req')
                break;
            case 'ConfigMap':
                data.push('003399');
                break;
            case 'Container':
                data.push('339933');
                break;
            case 'ContainerImage':
                data.push('ffd700');
                break;
            case 'ContainerName':
                data.push('ffa500');
                break;
            case 'ContainerPort':
                data.push('5b7c98');
                break;
            case 'ClusterRole':
                data.push('330033');
                break;
            case 'ClusterRoleBinding':
                data.push('330033');
                data.push('Clus\'Role\'Bind')
                break;
            case 'CronJob':
                data.push('330033');
                break;
            case 'CustomResourceDefinition':
                data.push('330033');
                break;
            case 'DaemonSet':
                data.push('008b8b');
                break;
            case 'Deployment':
                data.push('33cccc');
                break;
            case 'Endpoints':
                data.push('330033');
                break;
            case 'HorizontalPodAutoscaler':
                data.push('df3a01');
                data.push('Horz\'PodAuto\'')
                break;
            case 'Ingress':
                data.push('df3a01');
                break;
            case 'InitContainer':
                data.push('336699');
                break;
            case 'InitializerConfiguration':
                data.push('336699');
                break;
            case 'Job':
                data.push('6b8e23');
                break;
            case 'Labels':
                data.push('cd5c5c');
                break;
            case 'LabelsSpecTemplate':
                data.push('330033');
                data.push('Label\'Spc\'Tmpl')
                break;
            case 'LimitRange':
                data.push('cd5c5c');
                break;
            case 'List':
                data.push('330033');
                break;
            case 'LivenessProbe':
                data.push('330033');
                data.push('Liveness\'Prb');
                break;
            case 'Namespace':
                data.push('330033');
                break;
            case 'NetworkPolicy':
                data.push('330033');
                break;
            case 'NodeSelector':
                data.push('330033');
                break;
            case 'Node':
                data.push('330033');
                break;
            case 'Path':
                data.push('5858fa');
                break;
            case 'PersistentVolume':
                data.push('f4a460');
                data.push('Persistent\'Vol');
                break;    
            case 'PersistentVolumeClaim':
                data.push('a52a2a');
                data.push('Persist\'Vol\'Clm')
                break;
            case 'Pod':
                data.push('330033');
                break;
            case 'PodPreset':
                data.push('330033');
                break;
            case 'PodDisruptionBudget': 
                data.push('330033');
				data.push('PodDisrup\'Bgt');
                break;
            case 'PodSecurityPolicy':
                data.push('330033');
                data.push('PodSec\'Policy')
                break;
            case 'PodTemplate':
                data.push('330033');
                break;
            case 'PriorityClass':
                data.push('330033');
                break;
            case 'PV-Access':
                data.push('32cd32');
                break;
            case 'PV-Reclaim':
                data.push('cd5c5c');
                break;
            case 'PV-StorClass':
                data.push('b22222');
                break;
        	case 'ReadinessProbe':
                data.push('4b0082');
                data.push('Readiness\'Prb');
                break;
            case 'ReplicaSet':
                data.push('330033');
                break;
            case 'ReplicationController':
                data.push('330033');
                data.push('Rep\'Controller');
                break;
            case 'ResourceQuota':
                data.push('330033');
                break;
            case 'Role':
                data.push('330033');
                break;
            case 'RoleBinding':
                data.push('330033');
                break;
            case 'Secret':
                data.push('D9182D');
                break;
            case 'SecretUse':
                data.push('00182D');
                break;
            case 'Selector':
                data.push('330033');
                break;
            case 'Service':
                data.push('00bfff');
                break;
            case 'ServiceAccount':
                data.push('00bfff');
                break;
            case 'ServicePort':
                data.push('ffa07a');
                data.push('Port');
                break;
            case 'SourceFile':
                data.push('222222');
                break;
            case 'StatefulSet':
                data.push('666666');
                break;
            case 'StorageClass':
                data.push('6699bb');
                data.push('StorageClass');
                break;
            case 'TokenReview':
                data.push('77446d');
                break;
            case 'Tolerations':
                data.push('77446d');
                break;
            case 'Volume':
                data.push('dd6644');
                break;
            case 'VolumeAttachment':
                data.push('330033');
                data.push('Vol\'Attach\'');
                break;
            case 'VolumeClaimTemplates':
                data.push('2f4f4f');
                data.push('VolClmTemplt');
                break;
            case 'VolumeMount':
                data.push('b8995B');
                break;
            case 'VolumeMounts':
                data.push('b8995B');
                break;
            default:
                console.log('Undefined kind: ' + type);
                data.push('ff0000');
                data.push('Not in list');
            }
             return data;
}

//----------------------------------------------------------
console.log('loaded vpksvg.js');