(
	$
	M
	B
	Wreqr
	tpl
) <- define <[
	jquery
	marionette
	backbone
	backbone.wreqr
	tpl!signin
]>

{camelize, empty} = require \prelude-ls

class SignInView extends M.LayoutView
	class-name: 'container signin-view'
	template: tpl
	
	ui:
		\ucoz      : \.ucoz-enter
		\enter     : \.enter
		\register  : \.register
		\inputs    : 'input, button'
		\iemail    : 'input[name=email]'
		\ipassword : 'input[name=password]'
		\ucozwrap  : \iframe.ucoz-auth-wrapper
	
	events:
		'click @ui.ucoz'     : \ucoz-enter |> camelize
		'click @ui.enter'    : \enter
		'click @ui.register' : \register
	
	ucoz-wrap-url: \/signin-ucoz-iframe
	ucoz-enter: (e)!->
		e.prevent-default!
		const $btn =
			@ui.ucozwrap.contents!.find '#uLogin [data-uloginbutton=uid]'
		if $btn.length > 0
			@ajax-block!
		$btn.trigger \click
	
	on-render: !->
		@ui.ucozwrap.prop src: @ucoz-wrap-url
	
	destroy: !->
		if @ajax?
			@ajax.abort!
			delete @ajax
		super ...
	
	ajax-block: !->
		@ui.inputs.prop \disabled true
	ajax-free: !->
		@ui.inputs.prop \disabled false
		delete @ajax
	
	enter: (e)!->
		
		e.prevent-default!
		return if @ajax?
		@ajax-block!
		
		if (empty @ui.iemail.val!) or (empty @ui.ipassword.val!)
			window.alert 'Не заполнены обязательные поля!'
			@ajax-free!
			if empty @ui.iemail.val!
				@ui.iemail.focus!
			else
				@ui.ipassword.focus!
			return
		
		@ajax =
			$.post \/login, $.param do
				email    : @ui.iemail.val!
				password : @ui.ipassword.val!
		@ajax
			.then (data, status, jq-xhr)!~>
				return unless @ajax?
				Wreqr.radio.reqres.request \global, \auth-model .fetch do
					success: !~>
						if it.get camelize \is-auth
							delete @ajax
							B.history.navigate '', trigger: on, replace: yes
						else
							window.alert 'Произошла ошибка авторизации'
							@ajax-free!
							@ui.iemail.focus!
					error: !-> window.alert 'Произошла ошибка получения данных авторизации'
			.fail (jq-xhr)!~>
				return unless @ajax?
				if jq-xhr.status is 406
					window.alert 'Неверный логин/пароль'
				else
					window.alert 'Произошла ошибка обращения к серверу'
				@ui.ipassword.val ''
				@ajax-free!
				@ui.iemail.focus!
	
	register: (e)!->
		e.prevent-default!
		B.history.navigate \sign-up, trigger: on
