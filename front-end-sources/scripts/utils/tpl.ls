(jade, Wreqr) <- define <[ jade backbone.wreqr ]>

cfg = Wreqr.radio.reqres.request \global, \config
dir = cfg.static-dir

load = !(name, req, on-load, config)->
	path = "#{dir}/templates/#{name}.jade"
	text <-! req ["text!#{path}"]
	on-load jade.compile text

{load}
