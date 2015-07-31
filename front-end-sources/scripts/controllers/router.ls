(
	$
	M
	B
	Wreqr
	SignInView
	SignUpView
	WaitView
) <- define <[
	jquery
	marionette
	backbone
	backbone.wreqr
	views/signin
	views/signup
	views/wait
]>

{camelize, Obj, all} = require \prelude-ls

class Router extends M.AppRouter
	
	routes:
		do
			''          : 'main-route'
			
			'sign-in'   : 'sign-in'
			'sign-up'   : 'sign-up'
			'logout'    : 'logout'
			'sites'     : 'sites'
			'materials' : 'materials'
			
			'*defaults' : 'not-found'
		|> Obj.map (-> it |> camelize)
	
	routes-required-auth: <[ sites materials logout ]>
	
	initialize: !(opts)->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@auth-model.on \change, @check-auth, this
	
	get-option: M.proxy-get-option
	
	check-auth: !->
		const routes-required-auth = @routes-required-auth
		if [
			@auth-model.get camelize \is-auth |> (not)
			B.history.fragment |> (in routes-required-auth)
		] |> all
			console.warn 'Lost authorization, redirecting to sign-in form'
			B.history.navigate \sign-in, trigger: on
	
	main-route: !->
		console.info 'Main route'
		if @auth-model.get camelize \is-auth
			B.history.navigate \sites,   trigger: on, replace: yes
		else
			B.history.navigate \sign-in, trigger: on, replace: yes
	
	not-found: !->
		console.info 'Not found route'
		window.alert 'Страница не найдена'
		B.history.navigate '', trigger: on, replace: yes
	
	sign-in: !->
		console.info 'Sign in route'
		view = new SignInView!
		@get-option (camelize \target-region) .show view
	
	sign-up: !->
		console.info 'Sign up route'
		view = new SignUpView!
		@get-option (camelize \target-region) .show view
	
	logout: !->
		
		console.info 'Logout route'
		
		view = new WaitView!
		@get-option (camelize \target-region) .show view
		
		$.post \/logout
			.then (data, status, jq-xhr)!~>
				@auth-model.fetch do
					success: !~>
						if it.get camelize \is-auth
							window.alert 'Произошла ошибка разлогивания'
						B.history.navigate '', trigger: on, replace: yes
					error: !-> throw new Error 'Cannot fetch AuthModel'
			.fail (jq-xhr)!~>
				window.alert 'Произошла ошибка разлогивания'
				B.history.navigate '', trigger: on, replace: yes
	
	sites: !->
		console.info 'Sites route'
	
	materials: !->
		console.info 'Materials route'
