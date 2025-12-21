import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({ loading: true, error: null, latitude: null, longitude: null, accuracy: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loading: false, error: { code: 0, message: 'Geolocation not supported' } as GeolocationPositionError }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({ loading: false, error: null, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
    };

    const onError = (error: GeolocationPositionError) => {
      setState(s => ({ ...s, loading: false, error }));
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return state;
}
