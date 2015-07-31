(
	M
	B
	Wreqr
	RootView
	HeaderView
	HeaderMenuListView
	HeaderMenuCollection
	Router
) <- define <[
	marionette
	backbone
	backbone.wreqr
	views/root
	views/header
	views/header/menu/list
	collections/header/menu
	controllers/router
]>

class Application extends M.Application
	
	container: \body
	
	initialize: !(opts)->
		super ...
		@container = opts.container if opts.container?
		console.info "Application instance is initialized"
	
	on-start: !(opts)->
		
		const auth-model = Wreqr.radio.reqres.request \global, \auth-model
		#auth-model.fetch! # TODO
		
		@root-view = new RootView el: @container .render!
		@header = new HeaderView!
		
		@header-menu-collection = new HeaderMenuCollection
		@header-menu = new HeaderMenuListView do
			collection: @header-menu-collection
		
		@root-view.get-region \header .show @header
		@header.get-region \menu .show @header-menu
		
		@router = new Router!
		B.history.start!
