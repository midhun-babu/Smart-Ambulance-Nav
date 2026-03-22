import { useState, useRef, useCallback } from 'react';

export const useGps = (addAlert) => {
    const [userLocation, setUserLocation] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const watchIdRef = useRef(null);

    const handleGetGps = useCallback(() => {
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
    }, [addAlert]);

    const startGpsTracking = useCallback((onLocationUpdate) => {
        if (!navigator.geolocation) {
            addAlert('Geolocation is not supported.');
            return;
        }
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        setGpsLoading(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const loc = [latitude, longitude];
                setUserLocation(loc);
                setGpsLoading(false);
                if (onLocationUpdate) {
                    onLocationUpdate(loc);
                }
            },
            (err) => {
                setGpsLoading(false);
                addAlert(`GPS Tracking Error: ${err.message}`);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    }, [addAlert]);

    const stopGpsTracking = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    return { userLocation, setUserLocation, gpsLoading, handleGetGps, startGpsTracking, stopGpsTracking };
};
