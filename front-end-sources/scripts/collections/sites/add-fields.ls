(
	B
	AddSiteFieldModel
) <- define <[
	backbone
	models/sites/add-field
]>

class AddSiteFieldsCollection extends B.Collection
	model: AddSiteFieldModel
