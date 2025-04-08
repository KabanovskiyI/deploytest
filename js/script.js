class Location {
    getDistanceTo() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const data = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };

                    document.getElementById('latitude').textContent = `Широта: ${data.latitude}`;
                    document.getElementById('longitude').textContent = `Довгота: ${data.longitude}`;
                    document.getElementById('accuracy').textContent = `Точність: ±${data.accuracy} м`;

                    resolve({ latitude: data.latitude, longitude: data.longitude });
                },
                (error) => {
                    console.error("Помилка отримання геолокації:", error);
                    reject(error); 
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,  
                    maximumAge: 0 
                }
            );
        });
    }
}


class MapRenderer {
    constructor(element, imageWidth, imageHeight) {
        this.element = element;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.posX = 0;
        this.posY = 0;
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

const image = document.createElement('img');
image.src = "../image/Out.png";
image.style.width = '761px';  
image.style.height = '404px';
const mapContainer = document.getElementById('map-container');
mapContainer.appendChild(image);
const render = new MapRenderer(image, 761, 404);
setInterval(() => {
    render.updateMapPosition();
}, 1000);


