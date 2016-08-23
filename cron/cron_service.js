var CronJobManager = require('./crontab_manager.js');
var manager = new CronJobManager();
var exec = require('child_process').exec;
var cron = require('./cron.json'), fs    = require('fs')

for (var i = 0; i < cron.length; i++) {
	var f = function(v) {
		return function() {
			exec('cd ' + __dirname + ' &&  ' + v, function(error, stdout, stderr) {
				console.log(JSON.stringify({result:stdout, err:stderr}));
			});
			
		}
	};
	if (manager.exists( cron[i]['id'])) {
		manager.stop( cron[i]['id']);
	}
	
	
	if (cron[i].script) {
		if (!manager.exists( cron[i]['id'])) {
			
			manager.add( cron[i]['id'], cron[i]['schedule'], f(cron[i].script), null, false, "America/Los_Angeles");
		} else {
			manager.deleteJob( cron[i]['id']);
		}
		manager.start( cron[i]['id']);
	}	
}
