let projectFolder = 'dist';
let sourceFolder = 'src';

let path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/',
    },
    src: {
        html:[ sourceFolder + '/*.html',"!"+sourceFolder + '/_*.html'],
        css: sourceFolder + '/scss/style.scss',
        js: sourceFolder + '/js/script.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: sourceFolder + '/fonts/*.ttf',
    },
    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/scss/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + projectFolder + '/'
}
let {src, dest} = require('gulp');
let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let fileinclude = require('gulp-file-include');
let del = require('del');
let scss = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let groupMedia = require('gulp-group-css-media-queries');
let cleanCss = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
// let webp = require('gulp-webp');
// let webpHtml = require('gulp-webp-html');
// let webpCss = require('gulp-webp-css');
let svgSprite = require('gulp-svg-sprite');

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + projectFolder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        //.pipe(webpHtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle:'expanded'
        }))
        .pipe(
            groupMedia()
        )
        .pipe(
            autoprefixer({
                overrideBrowsersList:['last 5 version'],
                cascade:true
            })
        )
        //.pipe(webpCss())
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(
            rename({
                extname:'.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname:'.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function img() {
    return src(path.src.img)
        // .pipe(
        //     webp({
        //         quality:70
        //     })
        // )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive:true,
                svgoPlugins:[{removeViewBox:false}],
                interlaced:true,
                optimizationLevel:3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

gulp.task('svgSprite',function () {
    return gulp.src([sourceFolder+'/iconsprite/*.svg'])
        .pipe(
            svgSprite({
                mode:{
                    stack:{
                        sprite:"../icons/icons.svg"
                    }
                }
            })
        )
        .pipe(dest(path.build.img))
})

function watchFiles() {
    gulp.watch([path.watch.html],html);
    gulp.watch([path.watch.css],css);
    gulp.watch([path.watch.js],js);
    gulp.watch([path.watch.img],img);
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean,gulp.parallel(css,js,html,img));
let watch = gulp.parallel(build,watchFiles,browserSync);

exports.html = html;
exports.img = img;
exports.js = js;
exports.css = css;
exports.watch = watch;
exports.build = build;
exports.default = watch;