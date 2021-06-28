"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gulp_1 = require("gulp");
var gulp_babel_1 = __importDefault(require("gulp-babel"));
var gulp_beautify_1 = __importDefault(require("gulp-beautify"));
var gulp_file_include_1 = __importDefault(require("gulp-file-include"));
var gulp_clean_1 = __importDefault(require("gulp-clean"));
var gulp_changed_1 = __importDefault(require("gulp-changed"));
var browser_sync_1 = __importDefault(require("browser-sync"));
var gulp_concat_1 = __importDefault(require("gulp-concat"));
var gulp_sourcemaps_1 = __importDefault(require("gulp-sourcemaps"));
var gulp_imagemin_1 = __importDefault(require("gulp-imagemin"));
var gulp_postcss_1 = __importDefault(require("gulp-postcss"));
var autoprefixer_1 = __importDefault(require("autoprefixer"));
var gulp_exit_1 = __importDefault(require("gulp-exit"));
var postcss_easysprites_1 = __importDefault(require("postcss-easysprites"));
var gulp_plumber_1 = __importDefault(require("gulp-plumber"));
var gulp_notify_1 = __importDefault(require("gulp-notify"));
var sass = require('gulp-sass')(require('sass'));
var bsc = browser_sync_1.default.create('gulp');
var source = {
    html: 'src/*.html',
    css: 'src/dist/sass/*.scss',
    js: 'src/dist/js/*.js',
    font: 'src/dist/sass/font/*.+(ttf|eot|svg|woff|woff2)',
    jsLib: 'src/dist/js/lib/**/*',
    cssLib: 'src/dist/sass/lib/*.css',
    image: 'src/dist/image/**/*.+(jpeg|jpg|png|gif)'
};
var destination = {
    html: 'assets/',
    css: 'assets/dist/css',
    js: 'assets/dist/js',
    font: 'assets/dist/css/font',
    jsLib: 'assets/dist/js/lib',
    image: 'assets/dist/image'
};
var ASSETS = 'assets'; // 生成目录
// html处理
var htmlFn = function () {
    return gulp_1.src(source.html).pipe(gulp_file_include_1.default({
        prefix: '@',
        basepath: '@file'
    }))
        .pipe(gulp_changed_1.default(destination.html))
        .pipe(gulp_beautify_1.default.html({
        "indent_size": 4,
        "indent_char": " ",
        "eol": "\n",
        "indent_level": 0,
        "indent_with_tabs": false,
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "jslint_happy": false,
        "space_after_anon_function": false,
        "brace_style": "collapse",
        "keep_array_indentation": false,
        "keep_function_indentation": false,
        "space_before_conditional": true,
        "break_chained_methods": false,
        "eval_code": false,
        "unescape_strings": false,
        "wrap_line_length": 0,
        "wrap_attributes": "auto",
        "wrap_attributes_indent_size": 4,
        "end_with_newline": false
    }))
        .pipe(gulp_1.dest(destination.html))
        .pipe(bsc.reload({ stream: true }));
};
// js、css库以及font字体文件复制到生成目录
var jslibFn = function () { return gulp_1.src(source.jsLib).pipe(gulp_changed_1.default(destination.jsLib)).pipe(gulp_plumber_1.default()).pipe(gulp_1.dest(destination.jsLib)); };
var csslibFn = function () { return gulp_1.src(source.cssLib).pipe(gulp_changed_1.default(destination.css)).pipe(gulp_plumber_1.default()).pipe(gulp_1.dest(destination.css)); };
var fontFn = function () { return gulp_1.src(source.font).pipe(gulp_changed_1.default(destination.font)).pipe(gulp_1.dest(destination.font)); };
var imgFn = function () { return gulp_1.src(source.image).pipe(gulp_changed_1.default(destination.image)).pipe(gulp_1.dest(destination.image)); };
// scss文件处理
var cssFn = function () {
    return gulp_1.src(source.css)
        .pipe(gulp_changed_1.default(destination.css))
        .pipe(gulp_plumber_1.default())
        .pipe(gulp_sourcemaps_1.default.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp_postcss_1.default([autoprefixer_1.default, postcss_easysprites_1.default({
            imagePath: './src/dist/image',
            spritePath: './src/dist/image'
        })]))
        .pipe(gulp_concat_1.default('style.css'))
        .pipe(gulp_sourcemaps_1.default.write('./'))
        .pipe(gulp_1.dest(destination.css))
        .pipe(bsc.reload({ stream: true }));
};
// js文件处理
var jsFn = function () {
    return gulp_1.src(source.js)
        .pipe(gulp_changed_1.default(destination.js))
        .pipe(gulp_plumber_1.default())
        .pipe(gulp_babel_1.default({
        presets: ['@babel/env']
    }))
        .pipe(gulp_1.dest(destination.js))
        .pipe(bsc.reload({ stream: true }));
};
// 图片压缩处理
var imgminFn = function () {
    return gulp_1.src(source.image)
        .pipe(gulp_imagemin_1.default([
        gulp_imagemin_1.default.mozjpeg({ quality: 75, progressive: true }),
        gulp_imagemin_1.default.optipng({ optimizationLevel: 5 }),
        gulp_imagemin_1.default.svgo({
            plugins: [
                { removeViewBox: true },
                { cleanupIDs: false }
            ]
        })
    ]))
        .pipe(gulp_1.dest(destination.image))
        .pipe(bsc.reload({ stream: true }));
};
// 删除生成目录assets
var cleanFn = function () { return gulp_1.src(ASSETS, { allowEmpty: true }).pipe(gulp_clean_1.default()).pipe(gulp_notify_1.default('生成目录assets删除成功！')); };
var exit = function (done) {
    gulp_1.src(ASSETS, { allowEmpty: true }).pipe(gulp_notify_1.default('Exit！')).pipe(gulp_exit_1.default());
    done();
};
var watcher = {
    html: gulp_1.watch(source.html),
    css: gulp_1.watch([source.css, source.cssLib, source.font]),
    js: gulp_1.watch([source.js, source.jsLib]),
    image: gulp_1.watch(source.image)
};
var serve = function () {
    bsc.init({
        reloadDelay: 1000,
        server: {
            baseDir: ASSETS,
            directory: true
        },
        port: 8080
    });
    watcher.css.on('change', function (path) {
        console.log("File " + path + " was changed");
        cssFn();
    });
    watcher.html.on('change', function (path) {
        console.log("File " + path + " was changed");
        htmlFn();
    });
    watcher.js.on('change', function (path) {
        console.log("File " + path + " was changed");
        jsFn();
    });
    watcher.image.on('change', function (path) {
        console.log("File " + path + " was changed");
        imgFn();
    });
};
var operate = [htmlFn, cssFn, jsFn, fontFn, csslibFn, jslibFn];
var build = __spreadArray([imgminFn], operate);
var dev = __spreadArray([imgFn], operate);
// gulp默认命令，开发模式（为了提高响应速度，图片没有压缩）
exports.default = gulp_1.series(gulp_1.parallel.apply(void 0, dev), serve);
// 打包生成交付结果 assets
exports.build = gulp_1.series(cleanFn, gulp_1.parallel.apply(void 0, build), exit);
// 删除生成目录assets
exports.clean = gulp_1.series(cleanFn, exit);
// 预览生成目录，用于交付前的打包预览
exports.preview = gulp_1.series(cleanFn, gulp_1.parallel.apply(void 0, build), serve);
// 图片压缩
exports.imgminFn = gulp_1.series(imgminFn, exit);
