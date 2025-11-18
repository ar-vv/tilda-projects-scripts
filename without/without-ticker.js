// Пример вставки: <script src="https://your-domain.com/without-ticker.js"></script>
(function (script) {
    // Если скрипт загружен через src, используем document.currentScript, иначе переданный параметр
    if (!script) script = document.currentScript || document.querySelector('script[src*="without-ticker"]');
    if (!script) return; // Если скрипт не найден, выходим
    
    // Картинки
    var IMAGES = [
  "https://static.tildacdn.com/tild3635-3366-4930-b439-303333326138/1.png",
  "https://static.tildacdn.com/tild6533-6133-4261-b564-313239323531/2.png",
  "https://static.tildacdn.com/tild6239-3034-4435-b763-346335363237/3.png",
  "https://static.tildacdn.com/tild6266-3861-4335-b339-633834353461/4.png",
  "https://static.tildacdn.com/tild6364-3065-4835-b836-653938323639/5.png",
  "https://static.tildacdn.com/tild6166-3132-4430-b030-343931646462/6.png",
  "https://static.tildacdn.com/tild6364-3432-4334-b738-326361333830/7.png",
  "https://static.tildacdn.com/tild3539-3765-4165-b264-323036666638/8.png",
  "https://static.tildacdn.com/tild3162-3433-4532-a232-316532353764/9.png",
  "https://static.tildacdn.com/tild3232-6335-4335-b166-383737343263/10.png",
  "https://static.tildacdn.com/tild3664-6361-4238-a338-363038316265/12.png",
  "https://static.tildacdn.com/tild6665-6433-4838-b639-636631303039/13.png",
  "https://static.tildacdn.com/tild3061-6566-4931-b862-643636636536/14.png",
  "https://static.tildacdn.com/tild3337-6664-4730-b365-333835303464/15-1.png",
  "https://static.tildacdn.com/tild6463-6231-4366-b236-623338336564/15.png",
  "https://static.tildacdn.com/tild3431-3738-4638-b965-616136623836/16.png",
  "https://static.tildacdn.com/tild3735-6436-4962-b233-653636333236/17.png"
];


    var GAP    = 30;   // расстояние между картинками (точно 30px)
    var SPEED  = 70;  // пикселей в секунду
    var STYLE_ID = 'js-red-ticker-style-base-rf';

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            '.js-red-ticker-track-rf{' +
            '  display:flex;' +
            '  align-items:center;' +
            '  height:100%;' +
            '  gap:' + GAP + 'px;' +
            '  will-change:transform;' +
            '}' +
            '.js-red-ticker-track-rf img{' +
            '  height:100%;' +
            '  width:auto;' +
            '  flex:0 0 auto;' +
            '  display:block;' +
            '  margin:0;' +
            '  padding:0;' +
            '}';
        document.head.appendChild(style);
    }

    function initRedTicker() {
        ensureStyle();

        var elem = script.closest('.t396__elem, .tn-elem');
        if (!elem) return;

        var redDiv = elem.querySelector('.js-red-fill');
        if (!redDiv) {
            redDiv = document.createElement('div');
            redDiv.className = 'js-red-fill';
            elem.appendChild(redDiv);
        }

        var cs = window.getComputedStyle(elem);
        if (cs.position === 'static') {
            elem.style.position = 'relative';
        }

        redDiv.style.position   = 'absolute';
        redDiv.style.top        = '0';
        redDiv.style.left       = '0';
        redDiv.style.right      = '0';
        redDiv.style.bottom     = '0';
        redDiv.style.zIndex     = '1';
        redDiv.style.overflow   = 'hidden';
        redDiv.style.padding    = '0';
        redDiv.style.margin     = '0';
        // фон убран — не задаём background вообще

        redDiv.innerHTML = '';

        var track = document.createElement('div');
        track.className = 'js-red-ticker-track-rf';
        redDiv.appendChild(track);

        // Два ряда подряд: [A..N, A..N]
        var list = IMAGES.concat(IMAGES);

        var imgs = [];
        list.forEach(function (src) {
            var img = document.createElement('img');
            img.src = src;
            track.appendChild(img);
            imgs.push(img);
        });

        function waitImagesLoaded(callback) {
            var pending = imgs.length;
            if (pending === 0) {
                callback();
                return;
            }

            var done = false;
            function check() {
                if (done) return;
                var w = track.scrollWidth;
                if (w > 0) {
                    done = true;
                    callback();
                }
            }

            imgs.forEach(function (img) {
                if (img.complete) {
                    pending--;
                    if (pending <= 0) check();
                } else {
                    img.addEventListener('load', function () {
                        pending--;
                        if (pending <= 0) check();
                    });
                    img.addEventListener('error', function () {
                        pending--;
                        if (pending <= 0) check();
                    });
                }
            });

            setTimeout(check, 1000);
        }

        waitImagesLoaded(function () {
            var totalWidth = track.scrollWidth;
            if (!totalWidth) return;

            var rowWidth = totalWidth / 2;

            var offset = 0;
            var lastTime = null;

            function loop(ts) {
                if (!lastTime) {
                    lastTime = ts;
                }
                var dt = (ts - lastTime) / 1000;
                lastTime = ts;

                offset -= SPEED * dt;

                if (offset <= -rowWidth) {
                    offset += rowWidth;
                }

                track.style.transform = 'translateX(' + offset + 'px)';

                requestAnimationFrame(loop);
            }

            requestAnimationFrame(loop);
        });
    }

    function onReady(cb) {
        if (typeof t_onReady === 'function') {
            t_onReady(cb);
        } else if (document.readyState === 'complete' || document.readyState === 'interactive') {
            cb();
        } else {
            document.addEventListener('DOMContentLoaded', cb);
        }
    }

    onReady(initRedTicker);
})(document.currentScript || null);
