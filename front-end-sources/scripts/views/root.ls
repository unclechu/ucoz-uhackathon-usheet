(M, tpl) <- define <[ marionette tpl!root ]>

class RootView extends M.LayoutView
	
	template: tpl
	class-name: \v-stretchy
	
	initialize: !(opts)->
		super ...
		@$el.add-class @class-name
	
	regions:
		header: \#header
		body: \#body
