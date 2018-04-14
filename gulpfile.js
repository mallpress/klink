var gulp = require('gulp');
var es = require('event-stream');  
var jasmine = require('gulp-jasmine');
var typescript = require('gulp-tsc');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var typedoc = require("gulp-typedoc");

var tsProject1 = ts.createProject('tsconfig.json');
var tsProject2 = ts.createProject('tsconfig.json');


gulp.task('compile', function(){
  return es.merge(
    gulp.src(['src/**/*.ts', '!src/**/*.spec.ts'])
    .pipe(tsProject1())
    .pipe(concat('klink.js'))
    .pipe(gulp.dest('build')),
    gulp.src(['src/**/*.ts'])
    .pipe(tsProject2())
    .pipe(gulp.dest('tests'))
  );
});

gulp.task('test', function() {
   return gulp.src('tests/tests/klink.spec.js')
      .pipe(jasmine());
});

gulp.task("typedoc", function() {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(typedoc({
            exclude: "src/**/*.spec.ts",
            module: "system",
            target: "es2017",
            mode: "file",
            out: "docs/",
            name: "Rink"
        }))
    ;
});

gulp.task('ci', ['compile', 'test']);