(
	M
	B
	tpl
	MaterialModel
) <- define <[
	marionette
	backbone
	tpl!materials/add
	models/material
]>

{Obj, camelize, obj-to-pairs, map, pairs-to-obj} = require \prelude-ls

class AddMaterialView extends M.LayoutView
	class-name: 'add-material-view'
	template: tpl
	
	ui:
		\add    : 'button.add-material'
		\back   : 'button.back-to-list'
		\form   : 'form.add-material'
		\inputs : 'input, button'
	
	events:
		do
			'click @ui.add'  : 'add-material'
			'click @ui.back' : 'back-to-list'
		|> Obj.map (-> it |> camelize)
	
	ajax-block: !->
		@ui.inputs.prop \disabled true
	ajax-free: !->
		@ui.inputs.prop \disabled false
		delete @ajax
	
	add-material: (e)!->
		e.prevent-default!
		@ajax-block!
		
		const $required =
			@$ 'input[type=text][required], textarea[required]'
			|> (.filter -> ! $ this .val!)
		if $required.length > 0
			window.alert 'Не заполнены обязательные поля!'
			@ajax-free!
			$required.eq 0 .focus!
			return
		
		const material-model = new MaterialModel!
		data =
			@ui.form.serialize-array!
			|> map (-> [it.name, it.value])
			|> pairs-to-obj
		material-model.save data, do
			success: !~>
				B.history.navigate \materials, trigger: on
			error: !~>
				window.alert 'Произошла ошибка сохранения данных'
				@ajax-free!
	
	back-to-list: (e)!->
		e.prevent-default!
		B.history.navigate \materials, trigger: on
