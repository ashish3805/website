const nodemon = require('nodemon')

const gulp = require('gulp')
const less = require('gulp-less')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const concat = require('gulp-concat')

const paths = require('./paths.json')
const nodemon_config = require('./nodemon.json')

gulp.task('dependencies:install', () => gulp.src(paths.vendor.js.sources)
                                            .pipe(concat(paths.vendor.js.name))
                                            .pipe(gulp.dest(paths.vendor.js.destination)))

gulp.task('less', () => gulp.src(paths.less.source)
                            .pipe(less())
                            .pipe(rename(paths.less.name))
                            .pipe(gulp.dest(paths.less.destination)))

gulp.task('less:build', () => gulp.src(paths.less.source)
                                  .pipe(less())
                                  .pipe(cssnano())
                                  .pipe(rename(paths.less.name))
                                  .pipe(gulp.dest(paths.less.destination)))

gulp.task('less:watch', () => gulp.watch(paths.less.watch, ['less']))

gulp.task('nodemon', () => {
  const monitor = nodemon(nodemon_config)

  monitor.on('log', (log) => console.log(log.message))

  process.once('SIGINT', () => monitor.once('exit', () => process.exit()))
})

gulp.task('setup', [ 'dependencies:install', 'build' ])
gulp.task('watch', [ 'less:watch' ])
gulp.task('build', [ 'less:build' ])
gulp.task('default', [ 'less', 'watch', 'nodemon' ])
