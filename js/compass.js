class Compass {
    constructor(arrowElementId) {
        this.arrowElement = document.getElementById(arrowElementId);
        this._onOrientation = this._onOrientation.bind(this);
    }

    _onOrientation(event) {
        const alpha = event.alpha;
        if (alpha !== null) {
            const angle = -alpha + 180; // Поворот стрелки в противоположную сторону
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

window.addEventListener('DOMContentLoaded', () => {
    const compass = new Compass('arrow');
    compass.requestPermissionAndStart();
});