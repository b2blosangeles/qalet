var exec = require('child_process').exec;
var path = require('path');
var env = {root_space:path.join(__dirname, '../../')};

var Nedb = require(env.root_space + 'package/nedb/node_modules/nedb');


console.log(env);

var pkg = {
	crowdProcess:require(env.root_space + 'package/crowdProcess/crowdProcess'),
	request		:require(env.root_space + 'package/request/node_modules/request'),
	fs 			: require('fs'),
	Nedb 		: require(env.root_space + 'package/nedb/node_modules/nedb'),
	db 			: {
					post_cache 	: new Nedb({ filename:  env.root_space + '_db/post_cache.db', autoload: true }),
					get_cache 	: new Nedb({ filename:  env.root_space + '_db/get_cache.db', autoload: true }),
					auth	: new Nedb({ filename: env.root_space + '_db/auth.db', autoload: true }),
					vhost	: new Nedb({ filename: env.root_space + '_db/vhost.db', autoload: true })
				}
				
};

pkg.db.vhost.find({}).sort({ created: -1 }).exec(function (err, docs) {
	if (!err) {
		for (var i=0; i < docs.length; i++) {
			var _f = function(v) {
				return function() {
					pkg.fs.exists(env.root_space + '_microservice/' + v['name'], function(exists) {
						if (exists) {
							exec('cd ' + env.root_space + '_microservice/' + v['name'] + '&& git pull', function(err, out, code) {
								console.log(v['name'] + '::' + out);
							});
						} else {
							console.log(v['name'] + 'SKIPPED');
						}
					});	
				}
					
				
			};
		
			_f(docs[i])();
		}
	} else {
		console.log(err)
	}
});

exec('cd ' + __dirname + ' && git pull', function(error, stdout, stderr) {
	console.log({stdout:stdout, stderr:stderr})
});