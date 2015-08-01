(
	B
	MaterialModel
) <- define <[
	backbone
	models/material
]>

{camelize} = require \prelude-ls

class MaterialsCollection extends B.Collection
	url: '/site/blog_list'
	model: MaterialModel
	comparator: -> [(it.get camelize \add-date), (it.get \title)]
