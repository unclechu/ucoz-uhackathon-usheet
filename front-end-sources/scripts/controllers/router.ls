(
	M
	B
	Wreqr
) <- define <[
	marionette
	backbone
	backbone.wreqr
]>

{camelize, Obj, all} = require \prelude-ls

class Router extends M.AppRouter
	
	routes:
		do
			''          : 'main-route'
			
			'sign-in'   : 'sign-in'
			'logout'    : 'logout'
			'sites'     : 'sites'
			'materials' : 'materials'
			
			'*defaults' : 'not-found'
		|> Obj.map (-> it |> camelize)
	
	initialize: !(opts)->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@auth-model.on \change, @check-auth, this
	
	routes-required-auth: <[ sites materials logout ]>
	
	check-auth: !->
		const routes-required-auth = @routes-required-auth
		if [
			@auth-model.get camelize \is-auth |> (not)
			B.history.fragment |> (in routes-required-auth)
		] |> all
			console.warn 'Lost authorization, redirecting to sign-in form'
			B.history.navigate \sign-in, trigger: on
	
	main-route: !->
		if @auth-model.get (camelize \is-auth)
			B.history.navigate \sites,   trigger: on, replace: yes
		else
			B.history.navigate \sign-in, trigger: on, replace: yes
	
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
