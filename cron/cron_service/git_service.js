var exec = require('child_process').exec;
var path = require('path');
var env = {root_space:path.join(__dirname, '../../')};
var Nedb = require(env.root_space + 'package/nedb/node_modules/nedb');

var pkg = {
	crowdProcess:require(env.root_space + 'package/crowdProcess/crowdProcess'),
	request		:require(env.root_space + 'package/request/node_modules/request'),
	fs 			: require('fs'),
	Nedb 		: require(env.root_space + 'package/nedb/node_modules/nedb'),
	db 			: {
					post_cache 	: new Nedb({ filename:  env.root_space + '_db/post_cache.db', autoload: true }),
					get_cache 	: new Nedb({ filename:  env.root_space + '_db/get_cache.db', autoload: true }),
					auth	: new Nedb({ filename: env.root_space + '_db/auth.db', autoload: true }),
					vhost	: new Nedb({ filename: env.root_space + '_db/vhost.db', autoload: true }),
					git_log	: new Nedb({ filename: env.root_space + '_db/git_log.db', autoload: true })
				}
				
};

pkg.db.vhost.find({}).sort({ created: -1 }).exec(function (err, vhost) {
	var CP = new pkg.crowdProcess();
	
	var _f = {};			
			
	_f['root'] = function(cbk) {
		
		exec('cd ' + env.root_space + ' && git pull', function(error, stdout, stderr) {
			cbk({stdout:stdout, stderr:stderr});
		});						
	}	
	
	if (!err) {
		for (var i=0; i < vhost.length; i++) {
			
			_f['vhost_'+vhost[i]['name']] = (function(i) {
				return function(cbk) {
					pkg.fs.exists(env.root_space + '_microservice/' + vhost[i]['name'], function(exists) {
						if (exists) {
							exec('cd ' + env.root_space + '_microservice/' + vhost[i]['name'] + '&& git pull', function(err, out, code) {
								cbk(vhost[i]['name'] + '::' + out);
							});
						} else {
							cbk(vhost[i]['name'] + 'SKIPPED');
						}
					});						
					
				}
			})(i);				
		}
	} 
	CP.parallel(
		_f,
		function(data) {
			pkg.db.git_log.insert({time: new Date(),  data:data}, function (err) {
				if (err) console.log(err);
				else console.log('');
			});
		},
		60000
	);	
	
	
});

