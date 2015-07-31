(
	B
	HeaderMenuModel
) <- define <[
	backbone
	models/header/menu
]>

class HeaderMenuCollection extends B.Collection
	model: HeaderMenuModel
	defaults:
		* link: '#sites'     title: 'Список привязанных сайтов'
		* link: '#search'    title: 'Поиск по сайтам'
		* link: '#materials' title: 'Опубликованные материалы'
		* link: '#logout'    title: 'Выйти'
	initialize: !(models, opts)->
		super ...
		@add @defaults unless models?
