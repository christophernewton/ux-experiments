/**
 * Dependencies
 *
 * Base dependencies
 */
var gulp           = require( 'gulp' ),
		del            = require( 'del' ),
		concat         = require( 'gulp-concat' ),
		jshint         = require( 'gulp-jshint' ),
		minifyCss      = require( 'gulp-clean-css' ),
		rename         = require( 'gulp-rename' ),
		sass           = require( 'gulp-sass' ),
		sourcemaps     = require( 'gulp-sourcemaps' ),
		uglify         = require( 'gulp-uglify' ),
		util           = require( 'gulp-util' ),
		config         = require( './config.json' ),
		browserSync    = require( 'browser-sync' ),
		kraken         = require( 'gulp-kraken' ),
		plumber        = require( 'gulp-plumber' ),
		prefix         = config.coredna
			? './'
			: './source/';

/**
 * Clean CSS
 *
 * Removes all existing stylesheets from the stylesheets /dist dir
 */
gulp.task( 'clean-css', function(){
	return del( [
		prefix + 'stylesheets/dist/*.*'
	] );
} );

/**
 * Build CSS
 *
 * Compiles all.scss to all.css
 * Runs through Autoprefixer and adds/removes vendor prefixes to match last 3 browser versions
 * Creates associated source maps
 *
 * @flag Passing the --production flag will minify output and skip
 * source mapping
 *
 * @dependency clean-css
 */
gulp.task( 'build-css', [ 'clean-css' ], function(){
	return gulp.src( prefix + 'stylesheets/src/all.scss' )
		.pipe( config.production
			? util.noop()
			: sourcemaps.init() )
		.pipe(plumber( function(err) {
			console.log(err.toString());
			this.emit('end');
		}))
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( config.production
			? minifyCss()
			: util.noop() )
		.pipe( config.production
			? util.noop()
			: sourcemaps.write() )
		.pipe( rename( 'all.css' ) )
		.pipe( gulp.dest( prefix + 'stylesheets/dist/' ) );
} );

/**
 * Clean JS
 *
 * Removes all existing stylesheets from the javascripts /dist dir
 */
gulp.task( 'clean-js', function(){
	return del( [
		prefix + 'javascripts/dist/all.js'
	] );
} );

/**
 * Clean JS Libs
 *
 * Removes all existing stylesheets from the javascripts /dist dir
 */
gulp.task( 'clean-js-libs', function(){
	return del( [
		prefix + 'javascripts/dist/libs.js'
	] );
} );

/**
 * Build JS Libs
 *
 * Compiles all javascripts in the /libs dir to libs.js and creates
 * associated source maps
 *
 * @dependency clean-css
 */
gulp.task( 'build-js-libs', [ 'clean-js-libs' ], function(){
	return gulp.src( config.dependencies.javascripts )
		.pipe( config.production
			? util.noop()
			: sourcemaps.init() )
		.pipe(plumber( function(err) {
			console.log(err.toString());
			this.emit('end');
		}))
		.pipe( concat( 'libs.js' ) )
		.pipe( config.production
			? uglify()
			: util.noop() )
		.pipe( config.production
			? util.noop()
			: sourcemaps.write() )
		.pipe( gulp.dest( prefix + 'javascripts/dist' ) );
} );

/**
 * Build JS
 *
 * Compiles all javascripts in the /src dir to all.js and creates
 * associated source maps
 *
 * @dependency clean-css, build-js-libs, hint-js
 */
gulp.task( 'build-js', [ 'clean-js' ], function(){
	return gulp.src( prefix + 'javascripts/src/*.js' )
		.pipe( config.production
			? util.noop()
			: sourcemaps.init() )
		.pipe(plumber( function(err) {
			console.log(err.toString());
			this.emit('end');
		}))
		.pipe( concat( 'all.js' ) )
		.pipe( config.production
			? uglify()
			: util.noop() )
		.pipe( config.production
			? util.noop()
			: sourcemaps.write() )
		.pipe( gulp.dest( prefix + 'javascripts/dist' ) );
} );

 /**
 * Hint JS
 *
 * Provides JS code hinting
 */
gulp.task( 'hint-js', function(){
	return gulp.src( [ prefix + 'javascripts/src/*.js' ] )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) );
} );

 /**
 * Kraken
 *
 * Will watch /images/compress, any new files added will be processed through Kraken
 * and moved back to /images/
 * 
 * Run from cli with 'gulp kraken' or default 'gulp'
 * Runs kraken-compress and then kraken to move images to /images and cleans dir
 *
 */
 
gulp.task('kraken', ['kraken-compress'] , function (done) {
	gulp.src('images/compress/**/*.+(jpg|jpeg|png|svg|gif)')
		.pipe(plumber( function(err) {
			console.log(err.toString());
			this.emit('end');
		}))
		.pipe(gulp.dest('images'));
		done();
		del([
			'images/compress/**/*.+(jpg|jpeg|png|svg|gif)'
		]);

}); 

gulp.task('kraken-compress', function () {
	return gulp.src('images/compress/**/*.+(jpg|jpeg|png|svg|gif)')
		.pipe(plumber( function(err) {
			console.log(err.toString());
			this.emit('end');
		}))
		.pipe(kraken({
				key: config.krakenKey,
				secret: config.krakenSecretKey,
				lossy: true,
				concurrency: 6
		}));
});

 /**
 * Browser Sync
 *
 * Good for running parallel with a mobile phone or alternate browser to test
 * 
 */

gulp.task('browser-sync', function(){
	browserSync.init({
		proxy: config.siteUrl,
		open: false
	})
});

 /**
 * watch
 *
 * Files to watch and run whenever a change is detected
 *
 */
gulp.task( 'watch', [ 'browser-sync' ], function(){
	gulp.watch( [ prefix + 'stylesheets/**/*' ], [ 'build-css' ] );
	gulp.watch( [ prefix + 'javascripts/src/*' ], [ 'build-js', 'build-js-libs' ] );
	gulp.watch( [ 'images/compress/*' ], [ 'kraken' ] );
});

/**
 * Default
 *
 * Runs standing watch task
 */
gulp.task( 'default', [ 'watch' ] );