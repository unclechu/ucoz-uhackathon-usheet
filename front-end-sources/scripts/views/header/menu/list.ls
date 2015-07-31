(M, HeaderMenuItemView) <- define <[ marionette views/header/menu/item ]>

class HeaderMenuListView extends M.CollectionView
	tag-name   : \ul
	class-name : 'nav navbar-nav'
	child-view : HeaderMenuItemView
