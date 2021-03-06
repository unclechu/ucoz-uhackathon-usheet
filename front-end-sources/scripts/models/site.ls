(
	B
) <- define <[
	backbone
]>

{map, pairs-to-obj} = require \prelude-ls

class SiteModel extends B.Model
	
	url: '/site/add'
	
	defaults:
		<[
			url
			consumer_key
			consumer_secret
			oauth_token
			oauth_token_secret
		]>
		|> map (-> [it, ''])
		|> pairs-to-obj
		|> ->
			it <<< do
				_id: null
