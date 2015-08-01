(
	M
	B
	tpl
	SitesItemView
) <- define <[
	marionette
	backbone
	tpl!sites/list
	views/sites/item
]>

{Obj, camelize} = require \prelude-ls

class SitesListView extends M.CompositeView
	class-name: 'sites-list-view'
	template: tpl
	child-view: SitesItemView
	child-view-container: '@ui.list'
	
	ui:
		\add  : 'button.add-site'
		\list : 'table.table tbody'
	
	events:
		do
			'click @ui.add': 'add-site'
		|> Obj.map (-> it |> camelize)
	
	add-site: (e)!->
		e.prevent-default!
		B.history.navigate \sites/add, trigger: on
