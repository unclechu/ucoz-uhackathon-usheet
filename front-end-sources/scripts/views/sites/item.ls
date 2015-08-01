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
	
	ui:
		\rm : 'button.remove-site'
	
	events:
		'click @ui.rm': \rm
	
	rm: (e)!->
		e.prevent-default!
		const model = @model.clone!
		model.url = \/site/remove
		model.save {}, do
			error: !-> window.alert 'Произошла ошибка отвязки сайта'
			success: !~> @model.collection.remove @model
