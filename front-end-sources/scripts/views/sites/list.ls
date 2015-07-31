(
	M
	tpl
	SitesItemView
) <- define <[
	marionette
	tpl!sites/list
	views/sites/item
]>

class SitesListView extends M.CompositeView
	class-name: 'sites-list-view'
	template: tpl
	child-view: SitesItemView
