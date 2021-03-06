(
	$
	M
	B
	Wreqr
	SignInView
	SignUpView
	WaitView
	SitesListView
	AddSiteView
	SearchListView
	MaterialsListView
	AddMaterialView
	DescriptionView
) <- define <[
	jquery
	marionette
	backbone
	backbone.wreqr
	views/signin
	views/signup
	views/wait
	views/sites/list
	views/sites/add
	views/search/list
	views/materials/list
	views/materials/add
	views/description
]>

{camelize, Obj, and-list} = require \prelude-ls

class Router extends M.AppRouter
	
	routes:
		do
			''              : 'main-route'
			'description'   : 'description'
			
			'search'        : 'search'
			'sign-in'       : 'sign-in'
			'sign-up'       : 'sign-up'
			'logout'        : 'logout'
			
			'sites'         : 'sites'
			'sites/add'     : 'add-site'
			
			'materials'     : 'materials'
			'materials/add' : 'add-material'
			
			'*defaults'     : 'not-found'
			
		|> Obj.map (-> it |> camelize)
	
	routes-required-auth: <[
		sites
		materials
		logout
		search
	]>
	routes-prevent-auth: <[
		sign-in
		sign-out
	]>
	
	initialize: !(opts)->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@auth-model.on \change, @check-auth, this
	
	get-option: M.proxy-get-option
	
	check-auth: !->
		
		const routes-required-auth = @routes-required-auth
		const routes-prevent-auth  = @routes-prevent-auth
		
		[
			@auth-model.is-fetched
			@auth-model.get camelize \is-auth |> (not)
			B.history.fragment |> (.split \/) |> (.0) |> (in routes-required-auth)
		] |> and-list |> !->
			return unless it
			console.warn 'Lost authorization, redirecting to sign-in form'
			B.history.navigate \sign-in, trigger: on
		
		[
			@auth-model.get camelize \is-auth
			B.history.fragment |> (.split \/) |> (.0) |> (in routes-prevent-auth)
		] |> and-list |> !->
			return unless it
			console.warn 'Leave auth forms because we already authorized'
			B.history.navigate '', trigger: on
	
	on-route: !-> @check-auth!
	
	main-route: !->
		console.info 'Main route'
		if @auth-model.get camelize \is-auth
			B.history.navigate \description, trigger: on, replace: yes
		else
			B.history.navigate \sign-in, trigger: on, replace: yes
	
	not-found: !->
		console.info 'Not found route'
		window.alert 'Страница не найдена'
		B.history.navigate '', trigger: on, replace: yes
	
	description: !->
		
		console.info 'Description route'
		
		view = new DescriptionView!
		@get-option (camelize \target-region) .show view
	
	
	sign-in: !->
		
		console.info 'Sign in route'
		
		if @auth-model.get camelize \is-auth
			B.history.navigate '', trigger: on, replace: yes
			return
		
		view = new SignInView!
		@get-option (camelize \target-region) .show view
	
	sign-up: !->
		
		console.info 'Sign up route'
		
		if @auth-model.get camelize \is-auth
			B.history.navigate '', trigger: on, replace: yes
			return
		
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
					error: !->
						window.alert 'Произошла ошибка получения данных авторизации'
			.fail (jq-xhr)!~>
				window.alert 'Произошла ошибка разлогивания'
				B.history.navigate '', trigger: on, replace: yes
	
	
	sites: !->
		console.info 'Sites route'
		view = new SitesListView!
		@get-option (camelize \target-region) .show view
	
	add-site: !->
		console.info 'Add site route'
		view = new AddSiteView!
		@get-option (camelize \target-region) .show view
	
	
	materials: !->
		console.info 'Materials route'
		view = new MaterialsListView!
		@get-option (camelize \target-region) .show view
	
	add-material: !->
		console.info 'Add material route'
		view = new AddMaterialView!
		@get-option (camelize \target-region) .show view
	
	
	search: !->
		console.info 'Search route'
		view = new SearchListView!
		@get-option (camelize \target-region) .show view
