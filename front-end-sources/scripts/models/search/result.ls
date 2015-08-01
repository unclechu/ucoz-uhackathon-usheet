(
	B
) <- define <[
	backbone
]>

{camelize, map, pairs-to-obj} = require \prelude-ls

class SearchResultModel extends B.Model
	defaults:
		<[
			site-url
			url
			title
			description
		]>
		|> map (-> [it |> camelize, ''])
		|> pairs-to-obj
