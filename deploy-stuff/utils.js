'use strict';

var
	Stream    = require('stream'),
	path      = require('path'),
	c         = require('colors/safe'),
	argv      = require('yargs').argv,
	spawnSync = require('child_process').spawnSync,
	vfsFake   = require('vinyl-fs-fake'),
	gutil     = require('gulp-util'),
	rimraf    = require('rimraf');

var sep = '→';


/**
 * @callback getNewTransformator~transformCb
 * @param {string}   file
 * @param {string}   enc
 * @param {Function} cb
 */
/**
 * @public
 * @param {getNewTransformator~transformCb} transformCb
 */
var getNewTransformator =
module.exports.getNewTransformator =
function (transformCb) {
	var stream = new Stream.Transform({ objectMode: true });
	stream._transform = transformCb;
	return stream;
};


/**
 * @public
 * @param {string} filepath
 */
var getFileNameWithoutExt =
module.exports.getFileNameWithoutExt =
function (filepath) {
	var
		dirname  = path.dirname(filepath),
		extname  = path.extname(filepath),
		basename = path.basename(filepath, extname);
	return path.join(dirname, basename);
};


/**
 * @public
 * @param {string} logName
 * @param {Error}  err
 */
var watcherErrorHandler =
module.exports.watcherErrorHandler =
function (logName, err) {
	gutil.log(
		c.yellow(logName),
		sep,
		c.red('Watcher Error:'),
		err.stack || err
	);
};


/**
 * @public
 * @param {string}     logName
 * @param {Vinyl.File} file
 * @param {Error}      err
 */
var itemErrorHandler =
module.exports.itemErrorHandler =
function (logName, file, err) {
	
	gutil.log(
		c.yellow(logName),
		c.blue( getFileNameWithoutExt(file.relative) ),
		sep,
		c.red('Error:'),
		err.stack || err
	);
	
	// trigger of buildFinish with fail mode
	vfsFake.src([ file ])
		.pipe(buildFinish(logName, true))
		// trigget 'finish' event
		.on('finish', this.emit.bind(this, 'end'));
};


/**
 * @public
 * @param {string} logName
 */
var buildStart =
module.exports.buildStart =
function (logName) {
	
	if ( ! argv.buildLog) return gutil.noop();
	
	return getNewTransformator(function (file, enc, cb) {
		
		gutil.log(
			c.yellow(logName),
			c.blue( getFileNameWithoutExt(file.relative) ),
			sep,
			c.blue('building')
		);
		
		cb(null, file);
	});
};


/**
 * @public
 * @param {string} logName
 * @param {boolean} [isFail=false]
 */
var buildFinish =
module.exports.buildFinish =
function (logName, isFail) {
	
	if ( ! argv.buildLog) return gutil.noop();
	isFail = isFail ? true : false;
	
	return getNewTransformator(function (file, enc, cb) {
		
		gutil.log(
			c.yellow(logName),
			c.blue( getFileNameWithoutExt(file.relative) ),
			sep,
			isFail
				? c.red('build failed')
				: c.green('build successful')
		);
		
		cb(null, file);
	});
};


/**
 * git HEAD commit id
 *
 * @public
 * @type {string}
 */
var REVISION =
module.exports.REVISION =
(function () {
	
	var res = spawnSync('git', ['rev-parse', 'HEAD']);
	
	if (
		res.status !== 0
		|| ! res.stdout
		|| res.stdout.toString().length <= 0
	) {
		throw new Error('Cannot get head git commit id')
	}
	
	return res.stdout.toString().replace(/\s/g, '');
})();


/**
 * @callback delCb
 * @param {?Error} err
 */
/**
 * @public
 * @param {[String]} rmArr - list of files to remove
 * @param {delCb} cb
 */
var del =
module.exports.del =
function (rmArr, cb) {
	
	var item;
	
	function loop() {
		
		if (rmArr.length === 0) {
			cb(null);
			return;
		}
		
		item = rmArr.shift();
		
		rimraf(item, function (err) {
			
			if (err) {
				cb(err);
				return;
			}
			
			loop();
		});
	}
	
	loop();
};
