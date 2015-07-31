var _ = require('lodash');

var SiteRoute = {
	
	
	form: function(req, res) {
		console.log('here', 2);
		res.render('site/add.jade');
	},
	
	add: function(req, res) {
		var site = new U.model.site({
			url    : req.body.url,
			userId : req.user._id
		});
		
		// Проверка на включенность API
		console.log('add site', site.toObject());
		
		site.save(function(err) {
			console.error(err);
			
			if (err) {
				res.status(500).end('error');
			} else {
				res.json(site.toObject())
			}
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
		
		if ( ! query || query.length < 5) {
			return res.status(500).json({error: "query very small"});
		}
		
		U.async.serial(
			[
				function(cb) {
					req.user.getSites({isAPI: true}, res.ok(function(sites) {
						scope.sites = sites;
						
						cb();
					}));
				},
				
				function(cb) {
					var results = {};
					
					U.async.map(
						scope.sites,
						function(site, cb) {
							var params = _.extend({}, site.ucozApi);
							params.query = query;
							
							var api = new U.lib.UCozApi(params);
							
							api.exec(cb.ok(function(r) {
								results[site._id] = r;
								
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
