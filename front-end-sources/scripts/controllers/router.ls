(
	M
	Wreqr
) <- define <[
	marionette
	backbone.wreqr
]>

{camelize, Obj} = require \prelude-ls

class Router extends M.AppRouter
	
	routes:
		do
			''          : 'main-route'
			'*defaults' : 'not-found'
			
			'sign-in'   : 'sign-in'
			'logout'    : 'logout'
			'sites'     : 'sites'
			'materials' : 'materials'
		|> Obj.map (-> it |> camelize)
	
	initialize: !(opts)->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
	
	main-route: !->
		if @auth-model.get (camelize \is-auth)
			void
		else
			void
	
	not-found: !->
		console.log \not-found-route
	
	sign-in: !->
		console.log \sign-in-route
	
	logout: !->
		console.log \logout-route
	
	sites: !->
		console.log \sites-route
	
	materials: !->
		console.log \materials-route
