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
	jquery.ckeditor
]>

{Obj, camelize, obj-to-pairs, map, pairs-to-obj} = require \prelude-ls

class AddMaterialView extends M.LayoutView
	class-name: 'add-material-view'
	template: tpl
	
	ui:
		\add    : 'button.add-material'
		\back   : 'button.back-to-list'
		\form   : 'form.add-material'
		\inputs : 'input, button, textarea'
		\ititle : 'input[name=title]'
		\imsg   : 'textarea[name=message]'
		\idesc  : 'textarea[name=description]'
	
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
	
	on-render: !->
		!~>
			return if @ui.imsg.length < 1
			@ui.imsg.ckeditor!
			@ui.idesc.ckeditor!
		|> set-timeout _, 1
	
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
			title       : @ui.ititle.val!
			description : @ui.idesc.val!
			message     : @ui.imsg.val!
		material-model.save data, do
			success: !~>
				B.history.navigate \materials, trigger: on
			error: !~>
				window.alert 'Произошла ошибка сохранения данных'
				@ajax-free!
	
	back-to-list: (e)!->
		e.prevent-default!
		B.history.navigate \materials, trigger: on
