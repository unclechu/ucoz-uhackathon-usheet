(jade, Wreqr) <- define <[ jade backbone.wreqr ]>

cfg = Wreqr.radio.reqres.request \global, \config
dir = cfg.static-dir

traits = {} <<< cfg

load = !(name, req, on-load, config)->
	const path = "#{dir}/templates/#{name}.jade"
	text <-! req ["text!#{path}"]
	const compiled-tpl = jade.compile text
	data <- on-load
	{} <<< traits <<< data |> compiled-tpl

{load}
