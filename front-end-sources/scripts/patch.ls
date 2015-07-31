(M, jade) <- define <[ marionette jade ]>

<-! # func to export

#M.Renderer.render = !(template, data)->
#	console.log \kek, template, data
#	tpl = M.TemplateCache.get template
#
#M.TemplateCache.prototype.compile-template = (raw-tpl, opts)->
#	jade.compile raw-tpl
