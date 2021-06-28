import GulpClient, { series, parallel, src, dest, watch } from 'gulp'
import fs from 'fs'
import babel from 'gulp-babel'
import beautify from 'gulp-beautify'
import fileInclude from 'gulp-file-include'
import clean from 'gulp-clean'
import changed from 'gulp-changed'
import browserSync from 'browser-sync'
import concat from 'gulp-concat'
import sourcemap from 'gulp-sourcemaps'
import imagemin from 'gulp-imagemin'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import proExit from 'gulp-exit'
import easySprit from 'postcss-easysprites'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
const sass = require('gulp-sass')(require('sass'));
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
    js: 'src/dist/js/*.js',
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
const jslibFn = () => src(source.jsLib).pipe(changed(destination.jsLib)).pipe(plumber()).pipe(dest(destination.jsLib))
const csslibFn = () => src(source.cssLib as string).pipe(changed(destination.css)).pipe(plumber()).pipe(dest(destination.css))
const fontFn = () => src(source.font).pipe(changed(destination.font)).pipe(dest(destination.font))
const imgFn = () => src(source.image).pipe(changed(destination.image)).pipe(dest(destination.image))
// scss文件处理
const cssFn = () => {
    return src(source.css)
        .pipe(changed(destination.css))
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer, easySprit({
            imagePath: './src/dist/image',
            spritePath: './src/dist/image'
        })]))
        .pipe(concat('style.css'))
        .pipe(sourcemap.write('./'))
        .pipe(dest(destination.css))
        .pipe(bsc.reload({ stream: true }))
}

// js文件处理
const jsFn = () => {
    return src(source.js)
        .pipe(changed(destination.js))
        .pipe(plumber())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(destination.js))
        .pipe(bsc.reload({ stream: true }))
}
// 图片压缩处理

const imgminFn = () => {
    return src(source.image)
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(destination.image))
        .pipe(bsc.reload({ stream: true }))
}
// 删除生成目录assets
const cleanFn = () => src(ASSETS, { allowEmpty: true }).pipe(clean()).pipe(notify('生成目录assets删除成功！'))

const exit = (done: GulpClient.TaskFunctionCallback) => {
    src(ASSETS, { allowEmpty: true }).pipe(notify('Exit！')).pipe(proExit())
    done()
}

const watcher: Watch = {
    html: watch(source.html),
    css: watch([source.css, source.cssLib as string, source.font]),
    js: watch([source.js, source.jsLib]),
    image: watch(source.image)
}

const serve = () => {
    bsc.init({
        reloadDelay: 1000,
        server: {
            baseDir: ASSETS, //本地服务器目录
            directory: true
        },
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
    watcher.js.on('change', (path) => {
        console.log(`File ${path} was changed`);
        jsFn()
    })
    watcher.image.on('change', (path) => {
        console.log(`File ${path} was changed`);
        imgFn()
    })
}

const operate = [htmlFn, cssFn, jsFn, fontFn, csslibFn, jslibFn]
const build = [imgminFn, ...operate]
const dev = [imgFn, ...operate]

// gulp默认命令，开发模式（为了提高响应速度，图片没有压缩）
exports.default = series(parallel(...dev), serve)
// 打包生成交付结果 assets
exports.build = series(cleanFn, parallel(...build), exit)
// 删除生成目录assets
exports.clean = series(cleanFn, exit)
// 预览生成目录，用于交付前的打包预览
exports.preview = series(cleanFn, parallel(...build), serve)
// 图片压缩
exports.imgminFn = series(imgminFn, exit)


