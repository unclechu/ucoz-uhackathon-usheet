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
			description
			site-url
			url
			add-date
		]>
		|> map (-> [it |> camelize, ''])
		|> pairs-to-obj
