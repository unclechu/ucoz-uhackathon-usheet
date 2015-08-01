(
	B
	SiteModel
) <- define <[
	backbone
	models/site
]>

class SitesCollection extends B.Collection
	url: '/site/list'
	model: SiteModel
