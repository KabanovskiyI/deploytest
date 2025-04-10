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
        const alpha = event.alpha;
        if (alpha === null) return;

        const currentAzimuth = alpha;
        const azimuthToTarget = this._calculateAzimuthToTarget();
        if (azimuthToTarget === null) return;

        // Обновляем стрелку
        const arrowRotation = -currentAzimuth;
        this.arrowElement.style.transform = `translate(-50%, -50%) rotate(${arrowRotation}deg)`;

        // Вычисляем относительный угол до цели
        const relativeAngle = (azimuthToTarget - currentAzimuth + 360) % 360;
        this.targetElement.style.transform = `
            translate(-50%, -50%) 
            rotate(${relativeAngle}deg) 
            translate(90px) 
            rotate(-${relativeAngle}deg)
        `;
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