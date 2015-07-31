(B) <- define <[ backbone ]>

class AuthModel extends B.Model
	
	url: '/is_auth'
	defaults:
		is-auth  : no
		username : ''
	
	auto-fetch-interval: 15000
	auto-fetch-iteration: !->
		@auto-fetch-timer-id =
			!~>
				@fetch do
					success: !~> @auto-fetch-iteration!
					error:   !-> throw new Error 'Cannot fetch AuthModel'
			|> set-timeout _, @auto-fetch-interval
	start-auto-fetch: !-> @auto-fetch-iteration!
	stop-auto-fetch: !-> clear-timeout @auto-fetch-timer-id
	
	destroy: !->
		@stop-auto-fetch!
		super ...
