(
	B
	MaterialModel
) <- define <[
	backbone
	models/material
]>

{camelize, map, pairs-to-obj} = require \prelude-ls

class MaterialsCollection extends B.Collection
	url: '/site/blog_list'
	model: MaterialModel
