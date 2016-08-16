(function () { 
	
	var obj =  function (pkg, env, req, res) {
	
		this.getSpacename = function(vhost) {
			for (var i=0; i < vhost.length; i++) {
				if (vhost[i].domain){
					var patt = new RegExp(vhost[i].domain, 'i');
					if (patt.test(req.headers.host)) {
						return vhost[i].name;
					}					
				}
			}
			return false;	
		}
		
		this.requestType = function() {
			var patt = new RegExp('^/api/(.+|)', 'i');
			
			if (req.params[0]) {
				var v = req.params[0].match(patt);
				if (v) {
					return v[1];
				} 
			} 
			return false;
		}
		this.send404 = function(v) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(v + ' does not exist');
			res.end();		
		}	
		this.send500 = function(err) {
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.write('Error! ' + err.message);
			res.end();			
		}			
		this.runApi = function(v, vhost) {
			
			var me = this;
			var spacename = this.getSpacename(vhost);
			var space_dir = env.root_path + '/_microservice/' + spacename;
			var p = space_dir + '/api/' + v;

			pkg.fs.exists(p, function(exists) {
				if (exists) {
					pkg.fs.stat(p, function(err, stats) {
						 if (stats.isFile()) {
							
							try {
								delete require.cache[p];
								var taskClass = require(p);
							
								var entity = new taskClass(pkg, env, req, res);
							
								entity.call();
							} catch(err) {
								pkg.fs.readFile(p, 'utf8', function(err, code) {
									if (!err) {
										try {
											var localenv = {
												vhost_code: spacename,
												root_path:env.root_path,
												space_path:space_dir
											}
											new Function('require', 'pkg', 'env', 'req', 'res', code)
											(require, pkg, localenv, req, res);
										} catch(err) {
											me.send500(err);
										}
									} else {
										me.send500(err);										
									}
								});								
							}		

						 } else {
							me.send404(req.params[0]);									 
						 }
					});									
				} else {
					me.send404(req.params[0]);						
				} 
			});	
		}	
		
		this.load = function() {
			var me = this;

			pkg.db.vhost.find({}, function (err, vhost) {
				if (!err) {
					me.callAfterVhost(vhost);
				} else {
					res.send(err)
				}
				
			});	
		}	
		
		
		this.callAfterVhost = function(vhost) {
			var me = this;
			var spacename = this.getSpacename(vhost);

	
			var gitP = req.params[0].match(/_git\/(|.+)$/i);
			if (gitP) {
				delete require.cache[env.root_path + '/modules/gitModule/gitModule.js'];
				var gitModule  = require(env.root_path + '/modules/gitModule/gitModule.js');
				var gm = new gitModule(pkg, env, req, res);
				gm.load(gitP[1], spacename);				
				return true;
			}
			
			var tp = this.requestType();
			if (tp !== false) {
				this.runApi(tp, runApi);
				return true;
			}
			
			var path = require('path');
			var p = req.params[0];
			if (p.match(/\/$/i)) {
				p+='index.html';
			}
			
			if (spacename) {
				pkg.fs.exists(env.root_path + '/_microservice/' + spacename + p, function(exists) {
					if (exists) {
						pkg.fs.stat(env.root_path + '/_microservice/' + spacename + p, function(err, stats) {
							 if (stats.isFile()) { 
								res.sendFile(env.root_path + '/_microservice/' + spacename + p); 	
							 } else {
								me.send404(req.params[0]);								 
							 }
						});									
					} else {
						me.send404(req.params[0]);						
					} 
				});	
			} else {
				pkg.fs.exists(env.root_path + '/defaultsite/www' + p, function(exists) {
					if (exists) {
						pkg.fs.stat(env.root_path + '/defaultsite/www' + p, function(err, stats) {
							 if (stats.isFile()) { 
								res.sendFile(env.root_path + '/defaultsite/www' + p); 	
							 } else {
								me.send404(req.params[0]);								 
							 }
						});									
					} else {
						me.send404(req.params[0]);						
					} 
				});	
			}
		};	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();