(
	M
	tpl
) <- define <[
	marionette
	tpl!sites/item
]>

class SitesItemView extends M.ItemView
	class-name: 'sites-item-view'
	template: tpl
	tag-name: \tr
