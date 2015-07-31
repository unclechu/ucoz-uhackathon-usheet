(
	M
	B
	Wreqr
	tpl
) <- define <[
	marionette
	backbone
	backbone.wreqr
	tpl!header/menu/item
]>

class HeaderMenuItemView extends M.ItemView
	tag-name: \li
	template: tpl
	initialize: !->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@model.collection.on \route, @on-route, this
		@on-route!
		@template = let t = @template
			(data)~> {} <<< @auth-model.toJSON! <<< data |> t
	on-route: !->
		if (@model.get \link .slice 1) is B.history.fragment
			@$el.add-class \active
		else
			@$el.remove-class \active
