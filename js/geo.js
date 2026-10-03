// geo.js - Geolocation engine, Haversine distance calculator, and delivery estimators

const Geo = {
  EARTH_RADIUS_KM: 6371.0,

  /**
   * Calculate precise distance between two coordinates using the Haversine formula
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   * @returns {number} distance in kilometers (rounded to 1 decimal place)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return 0;
    }
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;

    return Math.round(distance * 10) / 10; // 1 decimal place e.g. 2.4 km
  },

  /**
   * Determine if a restaurant delivers to user's location based on its custom delivery radius
   * @param {number} userLat
   * @param {number} userLng
   * @param {object} restaurant
   * @returns {boolean}
   */
  isWithinDeliveryRadius(userLat, userLng, restaurant) {
    const dist = this.calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
    const maxRadius = restaurant.deliveryRadiusKm || 7.0;
    return dist <= maxRadius;
  },

  /**
   * Calculate dynamic estimated delivery time (e.g. "20-25 mins")
   * 15-20 mins kitchen prep + ~4 mins per km travel
   */
  calculateDeliveryTime(distanceKm) {
    const prepMin = 15;
    const travelMin = Math.round(distanceKm * 4.5);
    const totalMin = Math.max(18, prepMin + travelMin);
    const windowMin = totalMin + 7;
    return `${totalMin}-${windowMin} mins`;
  },

  /**
   * Calculate delivery fee based on distance
   * Base fee: ₹25 for first 2 km, + ₹9 per additional km
   * Free if distance < 1.0 km or subtotal > ₹499
   */
  calculateDeliveryFee(distanceKm, subtotal = 0) {
    if (subtotal >= 499) return 0;
    if (distanceKm <= 1.2) return 15;
    if (distanceKm <= 3.0) return 25;
    const extraKm = Math.ceil(distanceKm - 3.0);
    return Math.min(85, 25 + extraKm * 9);
  },

  /**
   * Request user's real browser GPS location
   * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        error => {
          let msg = 'Unable to retrieve location';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please select an address manually or choose a city hub.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },

  /**
   * Find closest named landmark or locality from known coordinates
   */
  getClosestKnownArea(lat, lng) {
    const knownAreas = [
      { name: 'Koramangala 5th Block', city: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
      { name: 'Indiranagar 100ft Road', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
      { name: 'HSR Layout Sector 3', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
      { name: 'Church Street / MG Road', city: 'Bengaluru', lat: 12.9745, lng: 77.6062 },
      { name: 'Whitefield ITPL', city: 'Bengaluru', lat: 12.9698, lng: 77.7500 },
      { name: 'Bandra West (Linking Rd)', city: 'Mumbai', lat: 19.0596, lng: 72.8295 },
      { name: 'Andheri West', city: 'Mumbai', lat: 19.1363, lng: 72.8277 },
      { name: 'Connaught Place', city: 'New Delhi', lat: 28.6315, lng: 77.2167 },
      { name: 'Hauz Khas Village', city: 'New Delhi', lat: 28.5494, lng: 77.1996 },
      { name: 'Hitec City, Madhapur', city: 'Hyderabad', lat: 17.4435, lng: 78.3772 },
      { name: 'Jubilee Hills', city: 'Hyderabad', lat: 17.4319, lng: 78.4073 },
      { name: 'T. Nagar, Usman Road', city: 'Chennai', lat: 13.0418, lng: 80.2341 },
      { name: 'Koregaon Park', city: 'Pune', lat: 18.5362, lng: 73.8940 },
    ];

    let closest = knownAreas[0];
    let minDistance = Infinity;

    for (const area of knownAreas) {
      const d = this.calculateDistance(lat, lng, area.lat, area.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = area;
      }
    }

    if (minDistance < 35.0) {
      return {
        addressLine: `${closest.name}, ${closest.city}`,
        locality: closest.name,
        city: closest.city,
        distanceFromAnchor: minDistance,
      };
    }

    return {
      addressLine: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      locality: 'Custom Location',
      city: 'India',
      distanceFromAnchor: minDistance,
    };
  },
};

window.Geo = Geo;
