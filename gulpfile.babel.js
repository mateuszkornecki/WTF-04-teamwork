import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import bSync from 'browser-sync';

// Configuration
const config = {
  styles: {
    src: './src/scss/**/*.{scss,sass}',
    dest: './public/assets/css/',
  },
  scripts: {
    src: './src/js/**/*.js',
    dest: './public/assets/js/',
  },
  images: {
    src: './src/images/**/*.{jpg,jpeg,png,svg,ico}',
    dest: './public/assets/images/',
  },
  fonts: {
    src: './src/fonts/**/*.{woff,woff2,ttf}',
    dest: './public/assets/fonts/',
  },
  html: {
    src: './src/html/**/*.html',
    dest: './public/',
  },
  public: {
    serv: './public',
    dist: './public/**',
    del: './public/**',
  },
};

// Browser Sync
const browserSync = bSync.create();
const reload = done => {
  browserSync.reload();
  done();
};

const server = () => {
  browserSync.init({
    server: {
      baseDir: config.public.serv,
    },
  });
};

// Styles
const styles = () => {
  return gulp
    .src(config.styles.src)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(
      rename({
        basename: 'style',
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest(config.styles.dest));
};

// Scripts
const scripts = () => {
  return gulp
    .src(config.scripts.src, {sourcemaps: true})
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(config.scripts.dest));
};

// Images
const images = () => {
  return gulp
    .src(config.images.src, {since: gulp.lastRun(images)})
    .pipe(
      imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [{removeViewBox: true}, {cleanupIDs: false}],
        }),
      ]),
    )
    .pipe(gulp.dest(config.images.dest));
};

// Fonts
const fonts = () => {
  return gulp
    .src(config.fonts.src, {since: gulp.lastRun(fonts)})
    .pipe(gulp.dest(config.fonts.dest));
};

// Html
const html = () => {
  return gulp
    .src(config.html.src, {since: gulp.lastRun(html)})
    .pipe(gulp.dest(config.html.dest));
};

// Watch
const watch = () => {
  gulp.watch(config.styles.src, gulp.series(styles, reload));
  gulp.watch(config.scripts.src, gulp.series(scripts, reload));
  gulp.watch(config.images.src, gulp.series(images, reload));
  gulp.watch(config.fonts.src, gulp.series(fonts, reload));
  gulp.watch(config.html.src, gulp.series(html, reload));
};

// Clean
const clean = () => {
  return del([config.public.del]);
};

// Build - dev
export const dev = gulp.parallel(
  styles,
  scripts,
  images,
  fonts,
  html,
  watch,
  server,
);

// Build - public
export const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, fonts, html),
);

// Default
export default dev;
