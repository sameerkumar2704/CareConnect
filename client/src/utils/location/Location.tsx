import axios from "axios";

const fetchLocationFromIP = async () => {
    const response = await axios.get("https://ipapi.co/json/");
    const data = response.data;
    return { lat: data.latitude, lon: data.longitude };
};

const getAccurateLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                reject(`Error: ${error.message}`);
            },
            {
                enableHighAccuracy: true, // Uses GPS for highest accuracy
                timeout: 20000, // Wait up to 20 seconds to get the most accurate location
                maximumAge: 0, // Always fetch a fresh location (no cache)
            }
        );
    });
};

export const getHighlyAccurateLocation = async () => {
    try {
        return await getAccurateLocation();
    } catch (error) {
        console.warn("GPS failed, trying IP-based geolocation...");
        return await fetchLocationFromIP();
    }
};