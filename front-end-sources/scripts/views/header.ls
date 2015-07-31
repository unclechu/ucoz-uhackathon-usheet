(M, tpl) <- define <[ marionette tpl!header ]>

class HeaderView extends M.LayoutView
	
	template: tpl
	class-name: 'container header-view'
	
	regions:
		\menu : \#header-menu
	
	initialize: !(opts)->
		super ...
		@$el.add-class @class-name
