(patch, Application) <- define <[ patch controllers/application ]>

initialize = !({container=null})->
	patch!
	app = new Application {container}
	app.start!

{initialize}
