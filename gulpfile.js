var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var nano        = require('gulp-cssnano');
var maps        = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var rename      = require("gulp-rename");
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( 'bundle' , ['exec', 'jekyll', 'build', '--config', '_config.yml'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('library/css/*.scss')
        .pipe(maps.init())
        .pipe(sass({
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(nano())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('library/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('library/css'));
});

/**
 * Compile files from js into both _site/js (for live injecting) and site (for future jekyll builds)
 */
gulp.task('js', function () {
    return gulp.src(['library/js/*.js','!library/js/*.min.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('library/js'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('js'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('library/css/*.scss', ['sass']);
    gulp.watch('library/js/*.js', ['js']);
    // gulp.watch(['*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

gulp.task('imagemin', function () {
    return gulp.src('library/images/**/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('imagemin-img'));
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['watch']);
