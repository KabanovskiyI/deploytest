class Compass {
    constructor(arrowElementId, targetElementId, targetLat, targetLon) {
        this.arrowElement = document.getElementById(arrowElementId);
        this.targetElement = document.getElementById(targetElementId);
        this.targetLat = targetLat;
        this.targetLon = targetLon;
        this.userLat = null;
        this.userLon = null;
        this._onOrientation = this._onOrientation.bind(this);
        this._updatePosition = this._updatePosition.bind(this);
        navigator.geolocation.watchPosition(this._updatePosition);
    }

    _updatePosition(position) {
        this.userLat = position.coords.latitude;
        this.userLon = position.coords.longitude;
    }

    _toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    _calculateAzimuthToTarget() {
        if (this.userLat === null || this.userLon === null) return null;

        const lat1 = this._toRadians(this.userLat);
        const lon1 = this._toRadians(this.userLon);
        const lat2 = this._toRadians(this.targetLat);
        const lon2 = this._toRadians(this.targetLon);
        const deltaLon = lon2 - lon1;

        const x = Math.cos(lat2) * Math.sin(deltaLon);
        const y = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

        let angle = Math.atan2(x, y);
        angle = (angle * 180 / Math.PI + 360) % 360; // В градусы и в диапазон [0, 360)

        return angle;
    }

    _onOrientation(event) {
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
        
        function clearPreviousPoints() {
            const points = document.querySelectorAll('.compass-point');
            points.forEach(point => point.remove());
        }

        function drawPointOnCircle(degree) {
            clearPreviousPoints();
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
        const alpha = event.alpha;
        const direction = calculateAzimuth(userLat, userLon, targetLat, targetLon);
        drawPointOnCircle(direction - alpha);
    }

    requestPermissionAndStart() {
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
            this.showPermissionModal().then(() => {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', this._onOrientation, true);
                        } else {
                            alert("Необхідно дозволити доступ до компаса.");
                        }
                    })
                    .catch(err => {
                        console.error("Помилка дозволу компаса:", err);
                    });
            });
        } else {
            window.addEventListener('deviceorientation', this._onOrientation, true);
        }
    }

    showPermissionModal() {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-box">
                        <p>Цей сайт хоче використовувати компас для визначення напрямку. Дозволити?</p>
                        <button id="compass-allow">Дозволити</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('compass-allow').onclick = () => {
                modal.remove();
                resolve();
            };
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const targetLat = 49.587702423984496;
    const targetLon = 34.542888596932954;
    const compass = new Compass('arrow', 'target', targetLat, targetLon);
    compass.requestPermissionAndStart();
});