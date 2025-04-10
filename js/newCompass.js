function calculateAzimuth(fromLat, fromLon, toLat, toLon) {
    const degreesToRadians = degrees => degrees * Math.PI / 180;
    const radiansToDegrees = radians => radians * 180 / Math.PI;

    const fromLatRad = degreesToRadians(fromLat);
    const toLatRad = degreesToRadians(toLat);
    const deltaLonRad = degreesToRadians(toLon - fromLon);

    const y = Math.sin(deltaLonRad) * Math.cos(toLatRad);
    const x = Math.cos(fromLatRad) * Math.sin(toLatRad) -
              Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(deltaLonRad);

    let azimuthRad = Math.atan2(y, x); // азимут в радианах
    let azimuthDeg = radiansToDegrees(azimuthRad); // перевод в градусы

    return (azimuthDeg + 360) % 360; // нормализация в диапазон [0, 360)
}


function drawPointOnCircle(degree) {
    const radius = 200; // радиус круга
    const centerX = window.innerWidth / 2; // центр экрана по оси X
    const centerY = window.innerHeight / 2; // центр экрана по оси Y

    // Переводим угол в радианы
    const angleInRadians = degree * Math.PI / 180;

    // Вычисляем координаты точки на окружности
    const x = centerX + radius * Math.sin(angleInRadians);
    const y = centerY - radius * Math.cos(angleInRadians);  // Минус, чтобы 0 градусов был вверху

    // Создаем элемент для точки
    const point = document.createElement('div');
    point.style.position = 'absolute';
    point.style.width = '10px';
    point.style.height = '10px';
    point.style.backgroundColor = 'red';  // Цвет точки
    point.style.borderRadius = '50%';  // Сделать точку круглой
    point.style.left = `${x - 5}px`;  // Центрируем точку по оси X
    point.style.top = `${y - 5}px`;   // Центрируем точку по оси Y

    // Добавляем точку на страницу
    document.body.appendChild(point);
}

const userLat = 49.57447992772844;
const userLon = 34.58300142453794;
const targetLat = 49.587752051894775;
const targetLon = 34.54299066738715;

const direction = calculateAzimuth(userLat, userLon, targetLat, targetLon);
console.log(`Двигайся в направлении: ${direction.toFixed(2)}°`);

function requestPermissionAndStart() {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        this.showPermissionModal().then(() => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', this.start, true);
                    } else {
                        alert("Необхідно дозволити доступ до компаса.");
                    }
                })
                .catch(err => {
                    console.error("Помилка дозволу компаса:", err);
                });
        });
    } else {
        window.addEventListener('deviceorientation', this.start, true);
    }
}

function start(event) {
    const alpha = event.alpha;
    setInterval(() => {
        // Используем правильный альфа-угол и вычитаем его из направления
        drawPointOnCircle(direction - alpha);
    }, 250);
}

requestPermissionAndStart();
