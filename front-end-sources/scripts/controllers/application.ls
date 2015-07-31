(M, B, RootView) <- define <[ marionette backbone views/root ]>

class Application extends M.Application
	
	container: \body
	
	initialize: !(opts)->
		super ...
		@container = opts.container if opts.container?
		console.info "Application instance is initialized"
	
	on-start: !(opts)->
		@root-view = new RootView el: @container .render!
		B.history.start!
