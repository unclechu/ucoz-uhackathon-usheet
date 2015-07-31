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
	tpl!signup
]>

{camelize, empty} = require \prelude-ls

class SignUpView extends M.LayoutView
	class-name: 'container signup-view'
	template: tpl
	
	ui:
		\enter     : \.enter
		\register  : \.register
		\inputs    : 'input, button'
		\iemail    : 'input[name=email]'
		\ipassword : 'input[name=password]'
	
	events:
		'click @ui.register' : \register
		'click @ui.enter'    : \enter
	
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
	
	register: (e)!->
		
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
		
		if @ui.iemail.val! isnt /^.+@.+$/
			window.alert 'Некорректно заполнено поле E-Mail'
			@ajax-free!
			@ui.iemail.focus!
			return
		
		@ajax =
			$.post \/register, $.param do
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
					error: !-> throw new Error 'Cannot fetch AuthModel'
			.fail (jq-xhr)!~>
				return unless @ajax?
				if jq-xhr.status is 406
					@ui.ipassword.val ''
					window.alert \
						'Пользователь с таким E-Mail-ом уже зарегистрирован'
				else
					window.alert 'Произошла ошибка обращения к серверу'
				@ajax-free!
				@ui.iemail.focus!
	
	enter: (e)!->
		e.prevent-default!
		B.history.navigate \sign-in, trigger: on
