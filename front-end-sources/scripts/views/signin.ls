(
	M
	tpl
) <- define <[
	marionette
	tpl!signin
]>

{camelize} = require \prelude-ls

class SignInView extends M.LayoutView
	class-name: 'container signin-view'
	template: tpl
	
	ui:
		\ucoz     : \.ucoz-enter
		\enter    : \.enter
		\register : \.register
	
	events:
		'click @ui.ucoz'     : \ucoz-enter |> camelize
		'click @ui.enter'    : \enter
		'click @ui.register' : \register
	
	ucoz-enter: (e)!->
		e.prevent-default!
		window.alert "Ещё не реализовано"
	
	enter: (e)!->
		e.prevent-default!
	
	register: (e)!->
		e.prevent-default!
