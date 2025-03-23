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
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
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