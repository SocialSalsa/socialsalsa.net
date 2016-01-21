//gulp
var gulp = require("gulp");

//plugins
var connect = require("gulp-connect");
var rimraf = require('gulp-rimraf');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');
var pngquant = require('imagemin-pngquant');
var sequence = require('gulp-sequence');
var htmlmin = require('gulp-htmlmin');
var inject = require('gulp-inject');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var imageminOptipng = require('imagemin-optipng');
var notify = require('gulp-notify');

//contants
var app_dir = './app';
var js_dir = app_dir + '/js';
var css_dir = app_dir + '/css';
var img_dir = app_dir + '/img';
var dist_dir = './dist';
var dist_js_dir = './dist/js';
var dist_css_dir = './dist/css';
var dist_fonts_dir = './dist/fonts';
var dist_img_dir = './dist/img';
var bower_dir = './app/vendor';

//helpers functions
function notifyUser(message){
    return notify({
        title: 'Notificação!',
        subtitle: 'CDTO-Mobile',
        message: message,
        icon: 'Terminal Icon'
    });
}

//tasks
gulp.task('serve', function() {
    connect.server({
        root: app_dir,
        port: 3000
    });
});

gulp.task('clean', function() {
    return gulp.src(dist_dir, {read: false})
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rimraf());
});

gulp.task('vendor-js', function(){
    return gulp.src([
        bower_dir + '/jquery/dist/jquery.min.js',
        bower_dir + '/bootstrap/dist/js/bootstrap.min.js',
        bower_dir + '/angular/angular.min.js',
        bower_dir + '/angular-ui-router/release/angular-ui-router.min.js',
        bower_dir + '/angular-touch/angular-touch.min.js',
        bower_dir + '/angular-local-storage/dist/angular-local-storage.min.js'
    ])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist_js_dir));
});

gulp.task('vendor-css', function(){
    return gulp.src([
        bower_dir + '/animate.css/animate.min.css',
        bower_dir + '/bootstrap/dist/css/bootstrap.min.css',
        bower_dir + '/font-awesome/css/font-awesome.min.css',
    ])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(concat('vendor.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(dist_css_dir));
});

gulp.task('vendor-fonts', function(){
    return gulp.src([
        bower_dir + '/font-awesome/fonts/fontawesome-webfont.*',
    ])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(gulp.dest(dist_fonts_dir));
});

gulp.task('vendor', ['vendor-js','vendor-css','vendor-fonts']);

gulp.task('css', function(){
    return gulp.src(css_dir + '/**/*.css')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(minifyCss())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(dist_css_dir));
});

gulp.task('js', function(){
    return gulp.src(js_dir + '/**/*.js')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(dist_js_dir));
});

gulp.task('img-png', function(){
    var os = require('os');
    var stream = gulp.src(img_dir + '/**/*.png')
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}));

    if(os.platform() !== 'win32') {
        stream.pipe(imageminOptipng ({
            optimizationLevel: 7
        })());
    }

    return stream.pipe(gulp.dest(dist_img_dir));
});

gulp.task('img', ['img-png']);

gulp.task('html', function(){
    return gulp.src(app_dir + '/*.html')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributesQuotes: true,
            removeRedundantAttributes: true,
            preventAttributesEscaping: true,
            useShortDoctype: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true,
            removeIgnored: true,
            minifyURLs: true,
            ignoreCustomComments: [
                /^\s+inject/,
                /^\s+endinject/
            ]
        }))
        .pipe(gulp.dest(dist_dir));
});

gulp.task('inject', function(){
    return gulp.src(dist_dir + '/index.html')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(inject(gulp.src([
            dist_css_dir + '/**/vendor*.css',
            dist_js_dir + '/**/vendor*.js',
            dist_css_dir + '/**/app*.css',
            dist_js_dir + '/**/app*.js'
        ]),
            {read: false, relative: true, removeTags: true}
        ))
        .pipe(gulp.dest(dist_dir))
        .pipe(connect.reload());
});

gulp.task('build-prod', function(callback){
    sequence('clean',['vendor','js','css','img'],'html','inject')(callback);
});

gulp.task('build-dev', function(callback){
    sequence(['js','css','img'],'html','inject')(callback);
});

gulp.task('build', ['build-prod']);

gulp.task('connect', function() {
    return connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('watch', function(){
    return gulp.watch([app_dir + '/**/*.*'],['build-dev']);
});

gulp.task('serve', function(callback) {
    sequence(['connect','build','watch'])(callback);
});
