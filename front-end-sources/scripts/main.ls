<-! define

{
	pairs-to-obj
	camelize
	Obj
	map
	any
} = require \prelude-ls

const html = document.get-elements-by-tag-name \html .0

is-bool-field = (name)->
	<[ is has ]> # prefixes
	|> map (-> "#{it}-")
	|> any (-> (name.index-of it) is 0)

const cfg =
	<[
		is-debug
		revision
		static-dir
	]>
	|> map (-> [it, html.get-attribute "data-#{it}"]              )
	|> map (-> it.1 = it.1 is \true if it.0 |> is-bool-field ; it )
	|> map (-> it.0 |>= camelize ; it                             )
	|> pairs-to-obj

const d = cfg.is-debug

shim  = {}
paths = {}
map   = {}

bower-libs-paths =
	jquery:
		"jquery/dist/jquery#{unless d then \.min else ''}"
	underscore:
		"underscore/underscore#{unless d then \-min else ''}"
	backbone:
		"backbone/backbone#{unless d then \-min else ''}"
	\backbone.wreqr :
		"backbone.wreqr/lib/backbone.wreqr#{unless d then \.min else ''}"
	\backbone.babysitter :
		"backbone.babysitter/lib/backbone.babysitter#{unless d then \.min else ''}"
	marionette:
		"marionette/lib/backbone.marionette#{unless d then \.min else ''}"
	text:
		"text/text"

# bower prefix
bower-libs-paths |>= Obj.map (-> "bower/#{it}")

paths <<< bower-libs-paths <<< do
	jade:
		"js/jade#{unless d then \.min else ''}"
	tpl:
		"js/build/utils/tpl"

# static dir prefix
paths |>= Obj.map (-> "#{cfg.static-dir}/#{it}")

requirejs.config {
	base-url: "#{cfg.static-dir}/js/build"
	url-args: "
		v=#{
			unless cfg.is-debug
			then cfg.revision
			else Date.now!
		}
	"
	shim
	paths
	map
}

(Wreqr) <-! requirejs <[ backbone.wreqr ]>
Wreqr.radio.channel \global .reqres.set-handler \config -> cfg

($, app) <-! requirejs <[ jquery app ]>
<-! $ # dom ready
app.initialize container: $ \#app
