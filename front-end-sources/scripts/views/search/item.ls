(
	M
	tpl
) <- define <[
	marionette
	tpl!search/item
]>

class SearchItemView extends M.ItemView
	class-name: 'search-item-view'
	template: tpl
	tag-name: \tr
