(
	M
	Wreqr
	tpl
) <- define <[
	marionette
	backbone.wreqr
	tpl!header/menu/item
]>

class HeaderMenuItemView extends M.ItemView
	tag-name: \li
	template: tpl
	initialize: !->
		super ...
		@auth-model = Wreqr.radio.reqres.request \global, \auth-model
		@template = let t = @template
			(data)~> {} <<< @auth-model.toJSON! <<< data |> t
