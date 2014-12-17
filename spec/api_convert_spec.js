/**
 * Frisby spec tests for the MathML Cloud API.
 *
 * TODO:
 * - set up independent test data
 * - test variety of output formats
 * - test failure conditions
 */
// With Frisby installed globally, we need the full path to find it
var frisby = require('/usr/local/lib/node_modules/frisby');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');

// Local testing
//var base_url = 'http://localhost:1337';
var base_url = 'http://mathmlcloud.azure-api.net';
//var base_url = 'http://104.40.56.172'; // mathmlcloud.azure-api.net
//var base_url = 'http://mathml-cloud.cloudapp.net';
//var base_url = 'http://23.101.204.234'; // mathml-cloud.cloudapp.net

var subscription_key = '6b442c2169084711afdd43ad5ba1dfeb';
// Local data
// var equation_id = '54907da59d199c6a0a85d97e';
// var component_id = '548b08e8a857f0db35d7a2bc';
// var html5_id = '54907d9d9d199c6a0a85d97b';

// Live data
var equation_id = '54874e5c62848a90ab0d79b8';
var component_id = '54874e6562848a90ab0d79bc';
var html5_id = '5490758da7967a8c61e10103';

describe("MathML Cloud API features", function() {
	// Global setup for all tests
	frisby.globalSetup({
	  request: {
	    headers:{'Accept': 'application/json'},
	    inspectOnFailure: true
	  }
	});

	//---- GET /component/{id}
	frisby.create("Get component")
		.get(base_url + '/component/' + component_id 
			+ "?subscription-key=" + subscription_key
		)
		.expectStatus(200)
		.expectHeaderContains("content-type", "text/html")
		.expectBodyContains('a squared plus b squared equals c squared')
		.toss();

	//---- GET /html5/{id}
	frisby.create("Get HTML5 resource")
		.get(base_url + '/html5/' + html5_id 
			+ "?subscription-key=" + subscription_key
		)
		.expectStatus(200)
		.expectHeaderContains("content-type", "application/json")
		.expectJSON("html5", {
			filename : "sample-math.html",
			outputFormat : "svg",
		})
		.toss();

	//---- GET /html5/{id}/output
	frisby.create("Get HTML5 output")
		.get(base_url + '/html5/' + html5_id + '/output'
			+ "?subscription-key=" + subscription_key
		)
		.expectStatus(200)
		.expectHeaderContains("content-type", "text/html")
		.toss();

	//---- GET /html5/{id}/source
	frisby.create("Get HTML5 source")
		.get(base_url + '/html5/' + html5_id + '/source'
			+ "?subscription-key=" + subscription_key
		)
		.expectStatus(200)
		.expectHeaderContains("content-type", "text/html")
		.toss();

	//---- POST /feedback
	frisby.create("Post feedback")
		.post(base_url + '/feedback' + "?subscription-key=" + subscription_key, {
			equation : equation_id, 
			comments : 'Testing API call',
		})
		.expectStatus(200)
		.expectHeaderContains("content-type", "application/json")
		.expectJSON({
			comments : 'Testing API call',
			equation : equation_id, 
		})
		.toss();

	//**** NOT YET WORKING ****
	
	//---- GET /equation/{id}
	frisby.create("Get equation")
		.get(base_url + '/equation/' + equation_id
			+ "?subscription-key=" + subscription_key
		)
		.expectStatus(200)
		.expectHeaderContains("content-type", "application/json")
		.expectJSON("components.?", {
			format : "svg",
		})
		.toss();
		
	//---- POST /equation
	frisby.create("Convert ASCII math")
		.post(base_url + '/equation' + "?subscription-key=" + subscription_key, {
			mathType : 'AsciiMath', 
			math : 'a^2+b^2=c^2',
			description : 'true',
		})
		.expectStatus(200)
		.expectHeaderContains("content-type", "application/json")
		.expectJSON("components.?", {
			format : "description",
			source : 'a squared plus b squared equals c squared'
		})
		.toss();
	
	//---- POST /equation/svg
	frisby.create("Convert ASCII math to SVG")
		.post(base_url + '/equation/svg' + "?subscription-key=" + subscription_key, {
			mathType : 'AsciiMath', 
			math : 'a^2+b^2=c^2',
			description : 'true',
		})
		.expectStatus(200)
		.expectHeaderContains("content-type", "image/svg+xml")
		.toss();
	
	//---- POST /html5
	// Set up the HTML5 file posting
	var html5Path = path.resolve(__dirname, './data/sample-math.html');
	var form = new FormData();
	form.append('outputFormat', 'svg');
	form.append('html5', fs.createReadStream(html5Path), {
		// we need to set the knownLength so we can call  form.getLengthSync()
		knownLength: fs.statSync(html5Path).size
	});

	frisby.create("Post HTML5")
		.post(base_url + '/html5' + "?subscription-key=" + subscription_key, 
		form,
		{
		    json: false,
		    headers: {
		      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
		      'content-length': form.getLengthSync()
		    },
		})
		.expectStatus(202)
		.expectHeaderContains("content-type", "application/json")
		.expectJSON({
			outputFormat : 'svg',
			"status" : 'accepted'
		})
		.toss();

	//---- POST by anonymous, denied
	frisby.create("Anonymous client")
		.post(base_url + '/feedback', {
			equation : equation_id, 
			comments : 'Testing API call',
		})
		.expectStatus(401)
		.expectHeaderContains("content-type", "application/json")
		.expectBodyContains('Access denied due to missing subscription key.')
		.toss();

	//---- POST by client with wrong subscription, denied
	frisby.create("Unsubscribed client")
		.post(base_url + '/feedback', {
			equation : equation_id, 
			comments : 'Testing API call',
			"subscription-key" : '1234567890'
		})
		.expectStatus(401)
		.expectHeaderContains("content-type", "application/json")
		.expectBodyContains('Access denied due to missing subscription key.')
		.toss();
});
