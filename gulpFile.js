'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    babelify = require("babelify"),
    watchify = require("watchify"),
    browserify = require("browserify"),
    rename = require("gulp-rename"),
    inject = require('gulp-inject-string'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    cssnano = require('gulp-cssnano'),
    merge = require('event-stream').merge,
    typescript = require('gulp-typescript'),
    reload = browserSync.reload;

var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');

function guidGenerator() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html:'src/**/*.html',
        js: 'src/app/js/Main.js',//['src/app/js/**/*.js','src/lib/js/**/*.js'],
        ts:['src/app/ts/**/*.ts'],
        style: ['src/app/styles/**/*.scss','src/lib/styles/**/*.scss'],
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    out:{
        js:{origin:'main.js',hash:guidGenerator()+ '.js'},
        style:{origin:'style.css',hash:guidGenerator()+ '.css'},
    },
    watch: {
        html: 'src/**/*.html',
        js: ['src/app/js/**/*.js','src/app/ts/**/*.ts'],
        style: 'src/app/styles/**/*.scss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_server"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    // del.sync(path.build.html);
    gulp.src(path.src.html)
        .pipe(rigger())

        .pipe(inject.replace(path.out.style.origin,  path.out.style.hash ))
        .pipe(inject.replace(path.out.js.origin,  path.out.js.hash ))
        .pipe(gulp.dest(path.build.html))
        .pipe(notify({ message: 'html task complete' }))
        .pipe(reload({stream: true}));
    // .pipe(livereload());
});

gulp.task('js:build', function () {
    // del.sync(path.build.js);
    var jse6 = watchify(browserify(path.src.js, { debug: true }).transform(babelify, {
        presets: ["es2015"],
        plugins: ["transform-class-properties"]
    })).bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('build.js'))
        // .pipe(rigger())
        .pipe(buffer())
        // .pipe(concat(path.out.js.hash))
        // .pipe(sourcemaps.init())
        // .pipe(uglify())
        // .pipe(rename({suffix: ".min"}))
        
        // .pipe(sourcemaps.write('./'))
    // .pipe(notify({ message: 'JS task complete' }))
    // .pipe(reload({stream: true}));;

    var jslibs =  gulp.src([
        './node_modules/three/build/three.min.js',
        './node_modules/three/examples/js/controls/OrbitControls.js',
        './bower_components/jquery/dist/jquery.min.js'

    ])
        .pipe(concat('vendors.js'));

    var ts = gulp.src(path.src.ts)
        .pipe(typescript({
            noImplicitAny: true,
            out: 'output.js',
            compilerOptions: {
                outDir: "build", // <--- newly added configuration parameter
                target: "ES5",
                module: "system",
                sourceMap: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                moduleResolution: "node",
                removeComments: false,
                noImplicitAny: true,
                suppressImplicitAnyIndexErrors: true
            },
            exclude: [
                "node_modules"
            ]
        }));

    return merge(jse6, ts,jslibs)
        .pipe(concat(path.out.js.hash))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(notify({ message: 'JS task complete' }))
        .pipe(reload({stream: true}));;
});

gulp.task('style:build', function () {
    // del.sync(path.build.css);
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(cssnano())
        .pipe(autoprefixer({
            browsers: ['last 16 versions'],
            cascade: false
        }))
        .pipe(concat(path.out.style.hash))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(notify({ message: 'Styles task complete' }))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    // del.sync(path.build.img);
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(notify({ message: 'Images task complete' }))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    // del.sync(path.build.html);
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(notify({ message: 'fonts task complete' }))
        .pipe(reload({stream: true}));
});

gulp.task('server', function(done) {
    http.createServer(
        st({ path: __dirname , index: 'index.html', cache: false })
    ).listen(8080, done);
});
// Clean
gulp.task('clean', function() {
    return  del.sync([path.build.css,path.build.js,path.build.fonts,path.build.html,path.build.img])
});

gulp.task('build', [
    'clean',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch(path.watch.js, function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    
    // Create LiveReload server
    // livereload.listen();
    //
    // gulp.watch(['src/**']).on('change', livereload.changed);
});


gulp.task('default', ['build', 'webserver', 'watch']);
