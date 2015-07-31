var _ = require('lodash');

var SiteRoute = {
	
	
	form: function(req, res) {
		console.log('here', 2);
		res.render('site/add.jade');
	},
	
	add: function(req, res) {
		var data = req.body;
		data.userId = req.user._id;
		
		data.url = data.url.replace(/https?:\/\//, '');
		
		var site = new U.model.site(data);
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
		})
	},
	
	list: function(req, res) {
		req.user.getSites({}, res.ok(function(sites) {
			res.json(
				sites.map(function(site) {
					return {
						url: site.url
					};
				})
			)
		}));
	},
	
	
	search: function(req, res) {
		var scope = {},
			query = req.body.query;
		
		if ( ! query || query.length < 2) {
			return res.status(500).json({error: "query very small"});
		}
		
		U.async.series(
			[
				function(cb) {
					req.user.getSites({isAPI: true}, cb.ok(function(sites) {
						scope.sites = sites;
						
						cb();
					}));
				},
				
				function(cb) {
					var results = {};
					
					U.async.map(
						scope.sites,
						function(site, cb) {
							var params = _.extend({url   : site.url}, site.ucozApi.toObject());
							
							var api = new U.lib.UCozApi(params);
							
							api.exec('/search', 'get', {query : query}, cb.ok(function(r) {
								if ( ! r.error) {
									results[site._id] = r;
								}
								
								cb();
							}));
						},
						cb.ok(function() {
							scope.searchs = Object.keys(results).map(function(siteId) {
								return {
									siteId : siteId,
									data   : results[siteId]
								};
							});
							
							cb();
						})
					)
				}
			],
			res.ok(function() {
				res.json(scope.searchs);
			})
		);
	},
	
	
	remove: function(req, res) {
		U.model.site.remove({url: req.body.url}).exec(res.ok(function(r) {
			res.json(r);
		}));
	}
};


module.exports = SiteRoute;
