(
	B
) <- define <[
	backbone
]>

{camelize, map, pairs-to-obj} = require \prelude-ls

class MaterialModel extends B.Model
	url: '/publish/blog'
	defaults:
		<[
			title
			message
			site-url
			url
		]>
		|> map (-> [it |> camelize, ''])
		|> pairs-to-obj
