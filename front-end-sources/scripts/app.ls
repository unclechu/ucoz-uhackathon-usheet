(Application) <- define <[ controllers/application ]>

initialize = !({container=null})->
	app = new Application {container}
	app.start!

{initialize}
