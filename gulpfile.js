const { src, dest, watch, parallel, series } = require('gulp'); // передаем все функции плагина на переменную src и dest 

const scss  	   = require('gulp-sass'); // передаем все функции плагина на переменную scss
const concat 	   = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify 	   = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin 	   = require('gulp-imagemin');
const del 		   = require('del')

function browsersync() {
	 browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist() {
	return del('dist')
}

function images() {
	return src('app/img/**/*')
		.pipe(imagemin([
		    imagemin.gifsicle({interlaced: true}),
		    imagemin.mozjpeg({quality: 75, progressive: true}),
		    imagemin.optipng({optimizationLevel: 5}),
		    imagemin.svgo({
		        plugins: [
		            {removeViewBox: true},
		            {cleanupIDs: false}
		        ]
		    })
		]))
		.pipe(dest('dist/img'))
		.pipe(browserSync.stream())
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'app/js/main.js'
	])
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/style.scss')  // пут к файлу
		// .pipe(scss()) означает какой плагин мы будем использоват 
		.pipe(scss({outputStyle: 'compressed'}))  //expanded / nested / compact / compressed 
		.pipe(concat('style.min.css')) // изменяем название файла 
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 version']
		}))
		.pipe(dest('app/css')) // что получим на выходе и куда получим  
		.pipe(browserSync.stream())
}

// перевод всех данных на папку dist
function build() {
	return src([
		'app/css/style.min.css',
		'app/fonts/**/*',
		'app/js/main.min.js',
		'app/*.html'
	],
	{base: 'app'}
	)
		.pipe(dest('dist'))


}

function watching() {
	watch(['app/scss/**/*.scss'], styles)
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
	watch(['app/*.html']).on('change', browserSync.reload)
}

exports.startStyles = styles;  // вызов функции
exports.startWatching = watching;
exports.startBrowsersync = browsersync;
exports.startScripts = scripts;
exports.startImages = images;
exports.startCleanDist = cleanDist;

exports.startBuild = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);
	