const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const gulpSass = require("gulp-sass");
const dartSass = require("sass");
const sass = gulpSass(dartSass);
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imageMin = require("gulp-imagemin");
const webP = require("gulp-webp");
const svgStore = require("gulp-svgstore");
const del = require("del");
const uglify = require('gulp-uglify');


const cleanBuild = () => {
    return del("build");
}

const copyHtml = () => {
    return gulp.src(["src/pages/*.html"])
        .pipe(gulp.dest("build"));
}
exports.copyHtml = copyHtml;


const copyFonts = () => {
    return gulp.src([
        "src/fonts/**/*.{woff, woff2}",
        "src/*.ico"
        ], {
            base: "src"
        })
        .pipe(gulp.dest("build"));
}
exports.copyFonts = copyFonts;


const sprite = () => {
    return gulp.src("src/assets/icons/*.svg")
        .pipe(svgStore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/assets/icons"))
}
exports.sprite = sprite;


const webp = () => {
    return gulp.src("src/assets/**/*.{png,jpg}")
        .pipe(webP({quality: 90}))
        .pipe(gulp.dest("build/assets/"))
}
exports.webp = webp;


const imageOptimization = () => {
    return gulp.src("src/assets/**/*.{jpg,png,svg}")
        .pipe(imageMin([
            imageMin.optipng({ optimizationLevel: 3}),
            imageMin.mozjpeg({progressive: true}),
            imageMin.svgo()
        ]))
}
exports.imageOptimization = imageOptimization;



const jsOptimization = () => {
    return gulp.src("src/js/**")
        .pipe(uglify())
        .pipe(gulp.dest("build/js/"));
}
exports.jsOptimization = jsOptimization;


const styles = () => {
    return gulp.src("src/sass/style.scss")
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(csso())
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css"))
        .pipe(sync.stream());
}
exports.styles = styles;


const server = (done) => {
    sync.init({
        server: {
            baseDir: 'build'
        },
        cors: true,
        notify: false,
        ui: false,
    });
    done();
}
exports.server = server;


const watcher = () => {
    gulp.watch("src/sass/**/*.scss", gulp.series("styles"));
    gulp.watch("src/pages/*.html", gulp.series("copyHtml"));
    gulp.watch("src/js/**/*.js", gulp.series("jsOptimization"));
}


exports.start = gulp.series(
    styles, server, watcher
);

exports.build = gulp.series(
    cleanBuild, copyFonts, styles, webp, sprite, copyHtml
);

exports.default = gulp.series(
    cleanBuild, copyFonts, styles, jsOptimization, imageOptimization, webp, sprite, copyHtml, server, watcher
);
