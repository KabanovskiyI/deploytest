// Класс для получения геолокации
class Location {
    getDistanceTo() {
        return new Promise((resolve, reject) => {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const accuracy = position.coords.accuracy;

                    // Показываем текущие данные
                    document.getElementById('latitude').textContent = `Широта: ${position.coords.latitude}`;
                    document.getElementById('longitude').textContent = `Довгота: ${position.coords.longitude}`;
                    document.getElementById('accuracy').textContent = `Точність: ±${accuracy} м`;

                    // Проверяем, достаточно ли точные координаты
                    if (accuracy <= 10) {
                        // Останавливаем наблюдение
                        navigator.geolocation.clearWatch(watchId);

                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    }
                },
                (error) => {
                    console.error("Помилка отримання геолокації:", error);
                    navigator.geolocation.clearWatch(watchId); // На всякий случай остановим
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,      // Дадим побольше времени на точное позиционирование
                    maximumAge: 0
                }
            );
        });
    }
}

// Класс для работы с картой
class MapRenderer {
    constructor(element, imageWidth, imageHeight) {
        this.element = element;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.posX = 0;
        this.posY = 0;
        this.arrow = document.getElementById('arrow');
        this.initCompass(this.arrow);
    }

    PositionOnMap(latitude, longitude) {
        const mapWidth = 761;
        const mapHeight = 404;

        const zero = {
            latitude: 49.57442,
            longitude: 34.58275
        };
        const topRight = {
            latitude: 49.57442, 
            longitude: 34.58316
        };
        const bottomLeft = {
            latitude: 49.57414,
            longitude: 34.58275
        };

        const procentLatitude = Math.abs((100 / (zero.latitude - bottomLeft.latitude)) * (bottomLeft.latitude - latitude));
        const procentLongitude = Math.abs((100 / (zero.longitude - topRight.longitude)) * (topRight.longitude - longitude));

        const x = parseInt((mapWidth / 100) * procentLatitude);
        const y = parseInt((mapHeight / 100) * procentLongitude);

        return { x, y };
    } 

    drawMap(x, y) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        const offsetX = centerX - x;
        const offsetY = centerY - y;

        this.posX = offsetX;
        this.posY = offsetY;
        this.element.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
    }

    updateMapPosition() {
        const location = new Location();

        location.getDistanceTo().then((data) => {
            const { latitude, longitude } = data;
            const { x, y } = this.PositionOnMap(latitude, longitude);
            this.drawMap(x, y);
        }).catch(error => console.error("Помилка оновлення позиції:", error));
    }
}

// Класс компаса
class Compass {
    constructor(arrowElementId) {
        this.arrowElement = document.getElementById(arrowElementId);
        this._onOrientation = this._onOrientation.bind(this);
    }

    _onOrientation(event) {
        const alpha = event.alpha;
        if (alpha !== null) {
            const angle = -alpha; // Поворот стрелки в противоположную сторону
            this.arrowElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }
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
            // Android/другие
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

// Создайте объект MapRenderer и Compass
window.addEventListener('DOMContentLoaded', () => {
    const compass = new Compass('arrow');
    compass.requestPermissionAndStart();

    const image = document.createElement('img');
    image.src = "image/Out.png";
    image.style.width = '761px';  
    image.style.height = '404px';
    const mapContainer = document.getElementById('map-container');
    mapContainer.appendChild(image);

    const render = new MapRenderer(image, 761, 404);
    setInterval(() => {
        render.updateMapPosition();
    }, 1000);
});
