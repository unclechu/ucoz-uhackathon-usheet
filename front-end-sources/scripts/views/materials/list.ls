(
	M
	B
	tpl
	MaterialItemView
	MaterialsCollection
) <- define <[
	marionette
	backbone
	tpl!materials/list
	views/materials/item
	collections/materials
]>

{Obj, camelize} = require \prelude-ls

class MaterialsListView extends M.CompositeView
	class-name: 'materials-list-view'
	template: tpl
	child-view: MaterialItemView
	child-view-container: '@ui.list'
	
	initialize: !->
		@collection = new MaterialsCollection
		super ...
		@collection.fetch do
			error: !-> window.alert 'Ошибка получения списка материалов'
	
	ui:
		\add  : 'button.add-material'
		\list : 'table.table tbody'
	
	events:
		do
			'click @ui.add': 'add-site'
		|> Obj.map (-> it |> camelize)
	
	add-site: (e)!->
		e.prevent-default!
		B.history.navigate \materials/add, trigger: on
