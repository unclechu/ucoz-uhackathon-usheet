(M, tpl) <- define <[ marionette tpl!header/menu/item ]>

class HeaderMenuItemView extends M.ItemView
	tag-name: \li
	template: tpl
