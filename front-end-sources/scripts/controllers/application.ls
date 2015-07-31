(
	M
	B
	RootView
	HeaderView
	HeaderMenuListView
	HeaderMenuCollection
) <- define <[
	marionette
	backbone
	views/root
	views/header
	views/header/menu/list
	collections/header/menu
]>

class Application extends M.Application
	
	container: \body
	
	initialize: !(opts)->
		super ...
		@container = opts.container if opts.container?
		console.info "Application instance is initialized"
	
	on-start: !(opts)->
		
		@root-view = new RootView el: @container .render!
		@header = new HeaderView!
		
		@header-menu-collection = new HeaderMenuCollection
		@header-menu = new HeaderMenuListView do
			collection: @header-menu-collection
		
		@root-view.get-region \header .show @header
		@header.get-region \menu .show @header-menu
		
		B.history.start!
