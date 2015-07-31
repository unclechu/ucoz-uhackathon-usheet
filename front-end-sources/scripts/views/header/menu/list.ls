(
	M
	Wreqr
	HeaderMenuItemView
) <- define <[
	marionette
	backbone.wreqr
	views/header/menu/item
]>

{camelize} = require \prelude-ls

class HeaderMenuListView extends M.CollectionView
	tag-name   : \ul
	class-name : 'nav navbar-nav'
	child-view : HeaderMenuItemView
	
	initialize: !(opts)->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@auth-model.on \change, @render, this
	
	filter: ->
		@auth-model.get camelize \is-auth
