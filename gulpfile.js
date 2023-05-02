// Подключение из gulp две const (src - получение пути, dest - положить файл по пути, watch - следит за изменениями в файле, parallel - запуск паралельно разные процессы, series - для поочерёдного выполнения действий gulp-сценария)
const {src, dest, watch, parallel, series} = require('gulp');
// Перевод из scss в css 
const scss = require('gulp-sass')(require('sass'));
// Для соединения файлов в 1 файл и переименовывания файлов
const concat = require('gulp-concat');
// Для минимизации js файла
const uglify = require('gulp-uglify-es').default;
// Для перезагрузки страницы при изменении в файлах
const browserSync = require('browser-sync').create();
// Для добавление префиксов для браузеров
const autoprefixer = require('gulp-autoprefixer');
// Для удаления файлов и папок
const clean = require('gulp-clean');

// Ф-ия для перевода scss в css 
function styles() {
	// Получение файла с которым будем работать
	return src('app/scss/style.scss')
		// Добавление префиксов
		.pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
		// Переименовывает файл
		.pipe(concat('style.min.css'))
		// Отрабатывает переменная scss (переводит в css и минифицирует) с файлом указанным в src выше 
		.pipe(scss({outputStyle: 'compressed'}))
		// Ложит отработанный файл по указанному пути 
		.pipe(dest('app/css'))
		// Обновляем страницу
		.pipe(browserSync.stream())
}
// Функция для js файлов
function scripts() {
	// Получение файла с которым будем работать (Сюда же добавляются файлы которые нужно подключать)
	return src('app/js/main.js')
		// Переименовывает файл
		.pipe(concat('main.min.js'))
		// Сжатие js файла
		.pipe(uglify())
		// Ложит отработанный файл по указанному пути 
		.pipe(dest('app/js'))
		// Обновляем страницу
		.pipe(browserSync.stream())
}

// Ф-ия которая будет следить за изменениями в файлах
function watching() {
	// Запуск watch и передаётся пеервым аргументом массив с путём к файлу (который ещё будет обрабатываться) за которыми нужно следить. Вторым аргуметом - выполнение действий после изменения в файле
	watch(['app/scss/style.scss'], styles)
	watch(['app/js/main.js'], scripts)
	watch(['app/*.html']).on('change', browserSync.reload)
	watch(['app/img/*.jpg'], imgToDist)
	watch(['app/img/*.png'], imgToDist)
	watch(['app/img/*.jpeg'], imgToDist)
}

// Ф-ия для перезагрузки страницы при изменении в дирректории
function browsersync() {
	browserSync.init({
		server: {
				// Отслеживаемая дарректория
				baseDir: "app/"
		}
	});
}

// Ф-ия для создания build сборки
function building() {

	return src([
		'app/css/style.min.css',
		'app/js/main.min.js',
		'app/index.html',
	], {base: 'app'}) /* Сохранить базовую структуру (чтобы создавались папки в которых ноходились файлы*/
	.pipe(dest('dist'))
}

// Перенос всех img
function imgToDist() {
	return src(['app/img/*.jpg','app/img/*.png', 'app/img/*.jpeg'])
		.pipe(dest('dist/img'))
}

// Ф-ия удаления папки build
function cleanDist() {

	return src('dist')	
		.pipe(clean())
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.imgToDist = imgToDist;

// Запуск данных действий по умолчанию при вызове gulp
exports.default = parallel(styles, scripts, browsersync, watching)
// Удаление папки dist и создание новой 
exports.build = series(cleanDist, imgToDist, building)