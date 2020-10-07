
let gulp = require("gulp"),
	sass = require("gulp-sass"),
	cssmin = require("gulp-cssmin"),
	cleancss = require("gulp-clean-css"),
	prefixer = require("gulp-autoprefixer"),
	babel = require("gulp-babel"),
	include = require("gulp-file-include"),
	browserSync = require("browser-sync"),
	rename = require("gulp-rename"),
	imagemin = require("gulp-imagemin"),
	recompress = require("imagemin-jpeg-recompress"),
	pngquant = require("imagemin-pngquant"),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require("gulp-webp-css"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	del = require("del"),
	ttf2woff = require("gulp-ttf2woff"),
	ttf2woff2 = require("gulp-ttf2woff2"),
	ttf2eot = require("gulp-ttf2eot"),
	size = require("gulp-filesize"),
	rsync = require("gulp-rsync"),
	sourcemaps = require("gulp-sourcemaps");

gulp.task("scss", function () {
	return gulp
		.src("src/scss/**/*.scss")
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: "compressed",
			}),
		)
		.pipe(
			rename({
				suffix: ".min",
			}),
		)
		.pipe(
			prefixer({

				overrideBrowserslist: ["last 8 versions"],
				browsers: [
					"Android >= 4",
					"Chrome >= 20",
					"Firefox >= 24",
					"Explorer >= 11",
					"iOS >= 6",
					"Opera >= 12",
					"Safari >= 6",
				],
			}),
		)
		.pipe(
			cleancss({
				compatibility: "ie8",
				level: {
					1: {
						specialComments: 0,
						removeEmpty: true,
						removeWhitespace: true,
					},
					2: {
						mergeMedia: true,
						removeEmpty: true,
						removeDuplicateFontRules: true,
						removeDuplicateMediaBlocks: true,
						removeDuplicateRules: true,
						removeUnusedAtRules: true,
					},
				},
			}),
		)
		.pipe(webpcss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("build/css"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),

		)
		.pipe(size());
});

gulp.task("style", function () {

	return gulp
		.src([

			"node_modules/normalize.css/normalize.css",
		])
		.pipe(concat("libs.min.css"))
		.pipe(cssmin())
		.pipe(gulp.dest("build/css"))
		.pipe(size());
});

gulp.task("script", function () {
	return gulp
		.src([
			"node_modules/jquery/dist/jquery.js"
		])
		.pipe(size())
		.pipe(babel())
		.pipe(concat("libs.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("build/js"))
		.pipe(size());
});

gulp.task("minjs", function () {
	return gulp
		.src("src/js/*.js")
		.pipe(size())
		.pipe(babel())
		.pipe(uglify())
		.pipe(
			rename({
				suffix: ".min",
			}),
		)
		.pipe(gulp.dest("build/js"))
		.pipe(size());
});

gulp.task("js", function () {
	return gulp.src("src/js/**/*.js").pipe(
		browserSync.reload({
			stream: true,
		}),
	);
});

gulp.task("html", function () {
	return gulp
		.src(["src/**/*.html", "!src/components/**/*.html"])
		.pipe(
			include({
				prefix: "@@",
				basepath: "@file",
			}),
		)
		.pipe(webphtml())
		.pipe(gulp.dest("build/"))
		.pipe(size())
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		);
});

gulp.task("font-woff", function () {
	return gulp
		.src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
		.pipe(ttf2woff())
		.pipe(gulp.dest("build/fonts/"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		);
});

gulp.task("font-woff2", function () {
	return gulp
		.src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
		.pipe(ttf2woff2())
		.pipe(gulp.dest("build/fonts/"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		);
});

gulp.task("font-eot", function () {
	return gulp
		.src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
		.pipe(ttf2eot())
		.pipe(gulp.dest("build/fonts/"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		);
});

gulp.task("images", function () {
	return gulp
		.src("src/images/**/*.+(png|jpg|jpeg|gif|svg|ico|webp)")
		.pipe(size())
		.pipe(
			imagemin(
				[
					recompress({
						loops: 4,
						min: 80,
						max: 100,
						quality: "high",
						use: [pngquant()],
					}),
					imagemin.gifsicle(),
					imagemin.optipng(),
					imagemin.svgo(),
				],
			),
		)
		.pipe(gulp.dest("build/images"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		)
		.pipe(size());
});

gulp.task("webp", function () {
	return gulp
		.src("src/images/**/*.+(png|jpg|jpeg|gif|svg|ico|webp)")
		.pipe(size())
		.pipe(webp({
			quality: 75,
			method: 6,
		}))
		.pipe(gulp.dest("build/images"))
		.pipe(
			browserSync.reload({
				stream: true,
			}),
		)
		.pipe(size())
});

gulp.task("deletefonts", function () {
	return del.sync("build/fonts/**/*.*");
});

gulp.task("deleteimg", function () {
	return del.sync("build/img/**/*.*");
});

gulp.task("watch", function () {
	gulp.watch("src/scss/**/*.scss", gulp.parallel("scss"));
	gulp.watch("src/**/*.html", gulp.parallel("html"));
	gulp.watch(
		"src/fonts/**/*.*",
		gulp.parallel("font-woff", "font-woff2", "font-eot"),
	);
	gulp.watch("src/js/**/*.js", gulp.parallel("minjs", "js"));
	gulp.watch("src/images/**/*.*", gulp.parallel("images", "webp"));
});

gulp.task("deploy", function () {
	return gulp.src("build/**").pipe(
		rsync({
			root: "build/",
			hostname: "yourLogin@yourIp",
			destination: "sitePath",
			include: ["*.htaccess"],
			exclude: ["**/Thumbs.db", "**/*.DS_Store"],
			recursive: true,
			archive: true,
			silent: false,
			compress: true,
			progress: true,
		}),
	);
});

gulp.task("browser-sync", function () {

	browserSync.init({
		server: {
			baseDir: "build/",
		},
		browser: [""],
		host: "192.168.0.104",
	});
});

gulp.task(
	"default",
	gulp.parallel(
		"browser-sync",
		"watch",
		"scss",
		"style",
		"script",
		"minjs",
		"html",
		"font-woff",
		"font-eot",
		"font-woff2",
		"images",
	),
);