var _ = require('lodash');
var mongoose = require('mongoose');

var SiteRoute = {
	
	
	form: function(req, res) {
		console.log('here', 2);
		res.render('site/add.jade');
	},
	
	
	remove: function(req, res) {
		var _id = req.body._id;
		if ( ! _id) {
			return res.status(500).json({error: {msg: "_id not defined"}})
		}
		
		U.model.site
			.remove({
				_id: mongoose.Types.ObjectId(_id)
			})
			.exec(res.ok(function() {
				return res.json({status: 'success'});
			}));
	},
	
	
	edit: function(req, res) {
		var data = req.body;
		var siteData = {
			userId  : req.body,
			url     : data.url.replace(/https?:\/\//, ''),
			ucozApi : {
				consumer_key       : data.consumer_key,
				consumer_secret    : data.consumer_secret,
				oauth_token        : data.oauth_token,
				oauth_token_secret : data.oauth_token_secret
			}
		};
		
		var site = new U.model.site(siteData);
		
		site.validate(function(err) {
			if (err) {
				return res.status(500).json({error: err});
			}
			
			// Проверка на включенность API
			U.async.map(
				[
					{
						url: 'blog'
					},
					{
						url       :'search',
						addParams : {
							query: "123"
						}
					}
				],
				
				function(p, cb) {
					try {
						var params = _.extend({url: data.url}, site.ucozApi.toObject());
						//console.log('params', params);
						var api = new U.lib.UCozApi(params);
						
						api.exec('/' + p.url, 'get', p.addParams, function(err, r) {
							if (err) return cb(err); 
							
							console.log('add site', err, r.error);
							
							if ( ! err && ! r.error) {
								site.isAPI = true;
							}
							
							cb();
						});
					} catch(e) {
						console.log('errrrr', e);
						cb(e);
					}
				},
				res.ok(function() {
					if (site.isAPI) {
						site.save(function(err) {
							console.log('err', err);
							if (err) {
								res.status(500).json(err);
							} else {
								res.json(site.toObject())
							}
						})
					} else {
						return res.status(500).json({error: {msg: "api should be turn off"}})
					}
				})
			);
		});
	},
	
	
	search: function(req, res) {
		var query = req.param('query');
		
		if ( ! query) {
			return res.status(500).json({error: {msg: "query not defined"}});
		}
		
		var scope = {
			sites   : [],
			results : []
		};
		
		U.async.series(
			[
				function(cb) {
					U.model.site.find({isAPI: true}).exec(function(err, sites) {
						if (err) return cb(err);
						
						scope.sites = sites;
						
						cb();
					})
				},
				
				function (cb) {
					U.async.map(
						scope.sites,
						function(site, cb) {
							try {
								var params = _.extend({url: site.url.replace(/\/$/, '')}, site.ucozApi.toObject());
								
								var api = new U.lib.UCozApi(params);
								
								api.exec('/search', 'get', {query: query}, function(err, r) {
									if (err) return cb(err);
									
									if ( ! r.results) return cb();
									
									r.results.forEach(function(result) {
										scope.results.push({
											siteUrl     : site.url,
											title       : result.title,
											url         : result.url,
											description : result.description,
											message     : result.message
										});
									});
									
									cb();
								});
							} catch(e) {
								cb(e);
							}
						},
						cb
					);
				}
			],
			res.ok(function() {
				res.json(scope.results);
			})
		);
	},
	
	
	blogList: function(req, res) {
		var scope = {
			sites   : [],
			results : []
		};
		
		U.async.series(
			[
				function(cb) {
					U.model.site.find({isAPI: true}).exec(function(err, sites) {
						if (err) return cb(err);
						
						scope.sites = sites;
						
						cb();
					})
				},
				
				function (cb) {
					U.async.map(
						scope.sites,
						function(site, cb) {
							try {
								var params = _.extend({url: site.url}, site.ucozApi.toObject());
								
								var api = new U.lib.UCozApi(params);
								
								api.exec('/blog', 'get', null, function(err, r) {
									if (err) return cb(err);
									
									r.blogs.forEach(function(blog) {
										scope.results.push({
											url     : site.url,
											title   : blog.title,
											message : blog.message,
										});
									});
									
									cb();
								});
							} catch(e) {
								cb(e);
							}
						},
						cb
					);
				}
			],
			res.ok(function() {
				res.json(scope.results);
			})
		);
	},
	
	add: function(req, res) {
		var data = req.body;
		data.userId = req.user._id;
		
		data.url = data.url.replace(/https?:\/\//, '');
		data.url = data.url.replace(/\/$/, '');
		
		var site = new U.model.site({
			url     : data.url,
			userId  : req.user._id,
			ucozApi : {
				consumer_key: data.consumer_key,
				consumer_secret: data.consumer_secret,
				oauth_token: data.oauth_token,
				oauth_token_secret: data.oauth_token_secret
			}
		});
		
		site.validate(function(err) {
			if (err) {
				return res.status(500).json({error: err});
			}
			
			// Проверка на включенность API
			U.async.map(
				[
					{
						url: 'blog'
					},
					{
						url       :'search',
						addParams : {
							query: "123"
						}
					}
				],
				function(p, cb) {
					try {
						var params = _.extend({url: data.url}, site.ucozApi.toObject());
						
						var api = new U.lib.UCozApi(params);
						
						api.exec('/' + p.url, 'get', p.addParams, function(err, r) {
							console.log('add site', err, r.error);
							
							if ( ! err && ! r.error) {
								site.isAPI = true;
							}
							
							cb();
						});
					} catch(e) {
						cb(e);
					}
				},
				res.ok(function() {
					if (site.isAPI) {
						site.save(function(err) {
							console.log('err', err);
							if (err) {
								res.status(500).json(err);
							} else {
								res.json(site.toObject())
							}
						})
					} else {
						return res.status(500).json({error: {msg: "api should be turn off"}})
					}
				})
			);
		});
	},
	
	list: function(req, res) {
		req.user.getSites({}, res.ok(function(sites) {
			res.json(
				sites.map(function(site) {
					return {
						_id : site._id,
						url : site.url
					};
				})
			)
		}));
	},
	
	
	publishPage: function(req, res) {
		var scope = {};
		var data = req.body;
		
		if ( ! data.title) {
			return res.status(500).json({error: "title in empty"});
		}
		
		if ( ! data.description) {
			return res.status(500).json({error: "description in empty"});
		}
		
		if ( ! data.message) {
			return res.status(500).json({error: "message in empty"});
		}
		
		U.async.series(
			[
				function(cb) {
					req.user.getSites({isAPI: true}, cb.ok(function(sites) {
						scope.sites = sites;
						
						cb()
					}));
				},
				
				function(cb) {
					U.async.map(
						scope.sites,
						function(site, cb) {
							var params = _.extend({url: site.url}, site.ucozApi.toObject());
							params.url = site.url;
							var api = new U.lib.UCozApi(params);
							
							api.exec(
								'/publ',
								'post',
								{
									'title'       : data.title,
									'description' : data.description,
									'message'     : data.message
								},
								function(err, r) {
									if (err) return cb(err);
									
									scope.results[site._id] = r;
									
									cb();
								}
							);
						},
						cb
					);
				}
			],
			function(err){
				if (err) return res.json({error: err});
				
				console.log('scope.results', scope.results);
				
				res.json(scope.results);
			}
		)
	},
	
	
	publishBlog: function(req, res) {
		var scope = {
			sites   : [],
			results : {}
		};
		var data = req.body;
		
		if ( ! data.title) {
			return res.status(500).json({error: "title in empty"});
		}
		
		if ( ! data.description) {
			return res.status(500).json({error: "description in empty"});
		}
		
		if ( ! data.message) {
			return res.status(500).json({error: "message in empty"});
		}
		
		U.async.series(
			[
				function(cb) {
					req.user.getSites({isAPI: true},function(err, sites) {
						if (err) return cb(err);
						
						scope.sites = sites;
						
						cb()
					});
				},
				
				function(cb) {
					U.async.map(
						scope.sites,
						function(site, cb) {
							var params = _.extend({url: site.url}, site.ucozApi.toObject());
							
							var api = new U.lib.UCozApi(params);
							
							api.exec(
								'/blog',
								'post',
								{
									'title'       : data.title,
									'description' : data.description,
									'message'     : data.message
								},
								function(err, r) {
									console.log('blog', site.url, err, r);
									
									if (err) return cb(err); 
									
									scope.results[site._id] = r;
									
									cb();
								}
							);
						},
						cb
					);
				}
			],
			res.ok(function(){
				//console.log('scope.results', scope.results);
				
				res.json(scope.results);
			})
		)
	},
	
	
	//search: function(req, res) {
	//	var scope = {},
	//		query = req.body.query;
	//	
	//	if ( ! query || query.length < 2) {
	//		return res.status(500).json({error: "query very small"});
	//	}
	//	
	//	U.async.series(
	//		[
	//			function(cb) {
	//				req.user.getSites({isAPI: true}, cb.ok(function(sites) {
	//					scope.sites = sites;
	//					
	//					cb();
	//				}));
	//			},
	//			
	//			function(cb) {
	//				var results = {};
	//				
	//				U.async.map(
	//					scope.sites,
	//					function(site, cb) {
	//						var params = _.extend({url: site.url}, site.ucozApi.toObject());
	//						
	//						var api = new U.lib.UCozApi(params);
	//						
	//						api.exec('/search', 'get', {query : query}, cb.ok(function(r) {
	//							if ( ! r.error) {
	//								results[site._id] = r;
	//							}
	//							
	//							cb();
	//						}));
	//					},
	//					cb.ok(function() {
	//						scope.searchs = Object.keys(results).map(function(siteId) {
	//							return {
	//								siteId : siteId,
	//								data   : results[siteId]
	//							};
	//						});
	//						
	//						cb();
	//					})
	//				)
	//			}
	//		],
	//		res.ok(function() {
	//			res.json(scope.searchs);
	//		})
	//	);
	//},
	
	
	remove: function(req, res) {
		U.model.site.remove({url: req.body.url}).exec(res.ok(function(r) {
			res.json(r);
		}));
	}
};


module.exports = SiteRoute;
