(
	M
	B
	tpl
	SearchItemView
	SearchResultsCollection
) <- define <[
	marionette
	backbone
	tpl!search/list
	views/search/item
	collections/search/results
]>

{Obj, camelize} = require \prelude-ls

class SearchListView extends M.CompositeView
	class-name: 'search-list-view'
	template: tpl
	child-view: SearchItemView
	child-view-container: '@ui.list'
	
	ui:
		\query  : 'input.search-query'
		\search : 'button.search'
		\list   : 'table.table tbody'
		\inputs : 'input button'
	
	initialize: !->
		@collection = new SearchResultsCollection
		super ...
	
	on-render: !->
		@ui.query.focus!
	
	events:
		'click @ui.search' : \search
	
	ajax-block: !->
		@ui.inputs.prop \disabled true
	ajax-free: !->
		@ui.inputs.prop \disabled false
	
	search: (e)!->
		e.prevent-default!
		@ajax-block!
		
		unless @ui.query.val!
			window.alert 'Строка поиска не заполнена'
			@ui.query.focus!
			return
		
		@collection.url = "
			/site/search?query=#{@ui.query.val! |> encodeURIComponent}
		"
		@collection.fetch do
			success: !~>
				@ajax-free!
			error: !~>
				window.alert 'Произошла ошибка получения результатов поиска от сервера'
				@ajax-free!
