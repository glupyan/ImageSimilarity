const gulp = require("gulp");
const htmlreplace = require("gulp-html-replace");

gulp.task("default", function() {
  console.log("hello world");
});

gulp.task("copy", function() {
  return gulp
    .src(["dev/**/*", "!dev/index.html", "!dev/dev.js"])
    .pipe(gulp.dest("prod"));
});

gulp.task("switchjs", function() {
  return gulp
    .src("dev/index.html")
    .pipe(
      htmlreplace({
        js: {
          src: "prod.js",
          tpl: '<script type="module" src="%s"></script>',
        },
        form: ""
      })
    )
    .pipe(gulp.dest("prod"));
});

gulp.task("prod", gulp.series(["copy", "switchjs"]));

gulp.task("watch", gulp.series(["copy", "switchjs"]), function() {
  gulp.watch(["dev/**/*", "!dev/index.html", "!dev/dev.js"], ["copy"]);
  gulp.watch("dev/index.html", ["switchjs"]);
});
