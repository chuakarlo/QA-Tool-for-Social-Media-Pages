var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var fs = require('fs');
var util = require('util');
var Queue = require('bull');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 3000;

let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let workQueue = new Queue('work', REDIS_URL);

//Post request

/**/
app.post("/job_tp", async(req, res) => {
	let job = await workQueue.add({ url: req.query.v, type: 'tp' });
	res.json({ id: job.id });
});

app.post("/job_fb", async(req, res) => {
	let job = await workQueue.add({ url: req.query.v, type: 'fb' });
	res.json({ id: job.id });
});

app.post("/job_gr", async(req, res) => {
	let job = await workQueue.add({ url: req.query.v, type: 'gr' });
	res.json({ id: job.id });
});

app.post("/job/:id", async(req, res) => {
	let id = req.params.id;
	let job = await workQueue.getJob(id);

	if (job === null) {
		res.status(404).end();
	} else {
		let state = await job.getState();
		let progress = job._progress;
		let reason = job.failedReason;
		let reviews = null;
		if (job.returnvalue !== null) {
			reviews = job.returnvalue.reviews;
		}
		res.json({ id, state, progress, reason, reviews });
	}
});

// Add new site details to list
app.post("/add_site_details", function(req, res) {
	var data = req.query;
	var sites = null;
	let site = {
		name: data.name,
		tp: data.tp,
		fb: data.fb,
		gr: data.gr
	};

	fs.readFile('public/sites.json', (err, data) => {
	    if (err) throw err;
		const writeFile = util.promisify(fs.writeFile);

	    sites = JSON.parse(data);
	    sites.push(site);

		writeFile('public/sites.json', JSON.stringify(sites, null, 2))
		.then(() => {console.log('success'); res.send('success');})
		.catch(error => console.log(error));
	});
});

server.listen(port, function() {
  console.log(" [200] " + "Node Status - running at port " + port);
});
