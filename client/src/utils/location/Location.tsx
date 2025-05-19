import axios from "axios";

const fetchLocationFromIP = async () => {
    const response = await axios.get("https://ipapi.co/json/");

    if (response.status !== 200) {

        const coordinates = localStorage.getItem("coordinates");

        if (coordinates) {
            const { lat, lon } = JSON.parse(coordinates);
            return { lat, lon };
        }

        throw new Error("Failed to fetch location from IP");
    }

    const data = response.data;

    localStorage.setItem("coordinates", JSON.stringify({ lat: data.latitude, lon: data.longitude }));

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
        const res = await getAccurateLocation();

        const { lat, lon } = res;

        localStorage.setItem("coordinates", JSON.stringify({ lat, lon }));

        return { lat, lon };

    } catch (error) {

        const res = localStorage.getItem("coordinates");

        if (res) {
            const { lat, lon } = JSON.parse(res);
            return { lat, lon };
        }

        console.warn("GPS failed, trying IP-based geolocation...");
        return await fetchLocationFromIP();
    }
};