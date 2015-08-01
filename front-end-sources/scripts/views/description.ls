(
	M
	B
	Wreqr
	tpl
) <- define <[
	marionette
	backbone
	backbone.wreqr
	tpl!description
]>

class DescriptionView extends M.LayoutView
	
	class-name: 'description-view'
	template: tpl
	
	initialize: !->
		@model = Wreqr.radio.reqres.request \global, \auth-model
		super ...
		@model.on \change, @render, this
	
	ui:
		\enter    : 'button.go-signin'
		\register : 'button.go-signup'
	
	events:
		'click @ui.enter'    : 'signin'
		'click @ui.register' : 'signup'
	
	signin: (e)!->
		e.prevent-default!
		B.history.navigate \sign-in, trigger: on
	
	signup: (e)!->
		e.prevent-default!
		B.history.navigate \sign-up, trigger: on
