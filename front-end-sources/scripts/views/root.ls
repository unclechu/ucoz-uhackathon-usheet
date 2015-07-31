(M, tpl) <- define <[ marionette tpl!views/root ]>

class RootView extends M.LayoutView
	
	template: tpl
	
	regions:
		header: \#header
		body: \#body
