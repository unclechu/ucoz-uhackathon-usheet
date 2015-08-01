(
	M
	B
	tpl
	SiteModel
	AddSiteFieldView
	AddSiteFieldsCollection
) <- define <[
	marionette
	backbone
	tpl!sites/add
	models/site
	views/sites/add-field
	collections/sites/add-fields
]>

{Obj, camelize, obj-to-pairs, map, pairs-to-obj} = require \prelude-ls

class AddSiteView extends M.CompositeView
	child-view: AddSiteFieldView
	child-view-container: '@ui.list'
	class-name: 'add-site-view'
	template: tpl
	
	fields-titles:
		url                : 'URL'
		consumer_key       : 'Consumer Key'
		consumer_secret    : 'Consumer Secret'
		oauth_token        : 'OAuth Token'
		oauth_token_secret : 'OAuth Token Secret'
	
	initialize: !->
		@collection =
			@fields-titles
			|> obj-to-pairs
			|> map ->
				name  : it.0
				title : it.1
			|> (-> new AddSiteFieldsCollection it)
		super ...
	
	ui:
		\add    : 'button.add-site'
		\back   : 'button.back-to-list'
		\list   : '.fields-list'
		\form   : 'form.add-site'
		\inputs : 'input, button'
	
	events:
		do
			'click @ui.add'  : 'add-site'
			'click @ui.back' : 'back-to-list'
		|> Obj.map (-> it |> camelize)
	
	ajax-block: !->
		@ui.inputs.prop \disabled true
	ajax-free: !->
		@ui.inputs.prop \disabled false
		delete @ajax
	
	add-site: (e)!->
		e.prevent-default!
		@ajax-block!
		
		const $required =
			@$ 'input[type=text][required]'
			|> (.filter -> ! $ this .val!)
		if $required.length > 0
			window.alert 'Не заполнены обязательные поля!'
			@ajax-free!
			$required.eq 0 .focus!
			return
		
		site-model = new SiteModel!
		data =
			@ui.form.serialize-array!
			|> map (-> [it.name, it.value])
			|> pairs-to-obj
		site-model.save data, do
			success: !~>
				B.history.navigate \sites, trigger: on
			error: !~>
				window.alert 'Произошла ошибка сохранения данных'
				@ajax-free!
	
	back-to-list: (e)!->
		e.prevent-default!
		B.history.navigate \sites, trigger: on
