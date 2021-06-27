import GulpClient, { src, series, dest, watch } from 'gulp'
import fs from 'fs'
import babel from 'gulp-babel'
import beautify from 'gulp-beautify'
import fileInclude from 'gulp-file-include'
import clean from 'gulp-clean'
import changed from 'gulp-changed'
import browserSync from 'browser-sync'
import concat from 'gulp-concat'
import sourcemap from 'gulp-sourcemaps'
const sass = require('gulp-sass')(require('sass'))
const bsc = browserSync.create('gulp')
interface Path {
    html: string
    css: string
    js: string
    font: string
    image: string
    jsLib: string
    cssLib?: string
}
interface Watch {
    html: fs.FSWatcher
    js: fs.FSWatcher
    image: fs.FSWatcher
    css: fs.FSWatcher
}
const source: Path = {
    html: 'src/*.html',
    css: 'src/dist/sass/*.scss',
    js: 'src/dist/js/**/*.js',
    font: 'src/dist/sass/font/*.+(ttf|eot|svg|woff|woff2)',
    jsLib: 'src/dist/js/lib/**/*',
    cssLib: 'src/dist/sass/lib/*.css',
    image: 'src/dist/image/**/*.+(jpeg|jpg|png|gif)'
}

const destination: Path = {
    html: 'assets/',
    css: 'assets/dist/css',
    js: 'assets/dist/js',
    font: 'assets/dist/css/font',
    jsLib: 'assets/dist/js/lib',
    image: 'assets/dist/image'
}
const ASSETS: string = 'assets' // 生成目录
// html处理
const htmlFn = () => {
    return src(source.html).pipe(fileInclude({
        prefix: '@',
        basepath: '@file'
    }))
        .pipe(changed(destination.html))
        .pipe(beautify.html({
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
        .pipe(dest(destination.html))
        .pipe(bsc.reload({ stream: true }))
}
// js、css库以及font字体文件复制到生成目录
const jslibFn = () => src(source.jsLib).pipe(changed(destination.jsLib)).pipe(dest(destination.jsLib))
const csslibFn = () => src(source.cssLib as string).pipe(changed(destination.css)).pipe(dest(destination.css))
const fontFn = () => src(source.font).pipe(changed(destination.font)).pipe(dest(destination.font))
// scss文件处理
const cssFn = () => {
    return src(source.css)
        .pipe(changed(destination.css))
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(sourcemap.write('./'))
        .pipe(dest(destination.css))
        .pipe(bsc.reload({ stream: true }))
}

// js文件处理
const jsFn = () => {

}


const cleanFn = () => {
    return src(ASSETS, { allowEmpty: true }).pipe(clean())
}

const watcher: Watch = {
    html: watch([source.css, source.cssLib as string]),
    css: watch([source.css, source.cssLib as string]),
    js: watch([source.css, source.cssLib as string]),
    image: watch([source.css, source.cssLib as string])
}

const serve = () => {
    bsc.init({
        server: ASSETS,
        port: 8080
    })
    watcher.css.on('change', (path) => {
        console.log(`File ${path} was changed`);
        cssFn()
    })
    watcher.html.on('change', (path) => {
        console.log(`File ${path} was changed`);
        htmlFn()
    })
}

exports.default = series(htmlFn)
exports.cssFn = cssFn
exports.clean = cleanFn
exports.jslibFn = jslibFn
exports.csslibFn = csslibFn
exports.fontFn = fontFn
exports.serve = serve

