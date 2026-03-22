import { useState } from 'react';

export const useGps = (addAlert) => {
    const [userLocation, setUserLocation] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);

    const handleGetGps = () => {
        if (!navigator.geolocation) {
            addAlert('Geolocation is not supported.');
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation([latitude, longitude]);
                setGpsLoading(false);
            },
            (err) => {
                setGpsLoading(false);
                addAlert(`GPS Error: ${err.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return { userLocation, setUserLocation, gpsLoading, handleGetGps };
};
