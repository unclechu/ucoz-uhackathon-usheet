(
	Wreqr
	Application
	AuthModel
) <- define <[
	backbone.wreqr
	controllers/application
	models/auth
]>

initialize = !({container=null})->
	auth-model = new AuthModel
	Wreqr.radio.channel \global .reqres.set-handler \auth-model -> auth-model
	app = new Application {container}
	app.start!

{initialize}
