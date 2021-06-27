"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gulp_1 = require("gulp");
var gulp_beautify_1 = __importDefault(require("gulp-beautify"));
var gulp_file_include_1 = __importDefault(require("gulp-file-include"));
var gulp_clean_1 = __importDefault(require("gulp-clean"));
var gulp_changed_1 = __importDefault(require("gulp-changed"));
var browser_sync_1 = __importDefault(require("browser-sync"));
var gulp_concat_1 = __importDefault(require("gulp-concat"));
var gulp_sourcemaps_1 = __importDefault(require("gulp-sourcemaps"));
var sass = require('gulp-sass')(require('sass'));
var bsc = browser_sync_1.default.create('gulp');
var source = {
    html: 'src/*.html',
    css: 'src/dist/sass/*.scss',
    js: 'src/dist/js/**/*.js',
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
var jslibFn = function () { return gulp_1.src(source.jsLib).pipe(gulp_changed_1.default(destination.jsLib)).pipe(gulp_1.dest(destination.jsLib)); };
var csslibFn = function () { return gulp_1.src(source.cssLib).pipe(gulp_changed_1.default(destination.css)).pipe(gulp_1.dest(destination.css)); };
var fontFn = function () { return gulp_1.src(source.font).pipe(gulp_changed_1.default(destination.font)).pipe(gulp_1.dest(destination.font)); };
// scss文件处理
var cssFn = function () {
    return gulp_1.src(source.css)
        .pipe(gulp_changed_1.default(destination.css))
        .pipe(gulp_sourcemaps_1.default.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp_concat_1.default('style.css'))
        .pipe(gulp_sourcemaps_1.default.write('./'))
        .pipe(gulp_1.dest(destination.css))
        .pipe(bsc.reload({ stream: true }));
};
// js文件处理
var jsFn = function () {
};
var cleanFn = function () {
    return gulp_1.src(ASSETS, { allowEmpty: true }).pipe(gulp_clean_1.default());
};
var watcher = {
    html: gulp_1.watch([source.css, source.cssLib]),
    css: gulp_1.watch([source.css, source.cssLib]),
    js: gulp_1.watch([source.css, source.cssLib]),
    image: gulp_1.watch([source.css, source.cssLib])
};
var serve = function () {
    bsc.init({
        server: ASSETS,
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
};
exports.default = gulp_1.series(htmlFn);
exports.cssFn = cssFn;
exports.clean = cleanFn;
exports.jslibFn = jslibFn;
exports.csslibFn = csslibFn;
exports.fontFn = fontFn;
exports.serve = serve;
