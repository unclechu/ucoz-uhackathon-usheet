(
	B
	SearchResultModel
) <- define <[
	backbone
	models/search/result
]>

{camelize, map, pairs-to-obj} = require \prelude-ls

class SearchResultsCollection extends B.Collection
	model: SearchResultModel
