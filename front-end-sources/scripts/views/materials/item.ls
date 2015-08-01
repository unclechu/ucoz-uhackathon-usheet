(
	M
	tpl
) <- define <[
	marionette
	tpl!materials/item
]>

class MaterialItemView extends M.ItemView
	class-name: 'materials-item-view'
	template: tpl
	tag-name: \tr
