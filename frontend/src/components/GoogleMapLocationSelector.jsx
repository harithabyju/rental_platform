import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, StandaloneSearchBox } from '@react-google-maps/api';
import { FaCrosshairs, FaSearch } from 'react-icons/fa';
import { MapPin } from 'lucide-react';

const libraries = ['places'];

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '24px'
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090 // Delhi
};

const GoogleMapLocationSelector = ({ lat, lng, radius, onLocationChange }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    const [map, setMap] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [center, setCenter] = useState({ lat, lng });

    const isPlaceholderKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here' || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (lat && lng) {
            setCenter({ lat, lng });
        }
    }, [lat, lng]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onSearchBoxLoad = (ref) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            const newLat = place.geometry.location.lat();
            const newLng = place.geometry.location.lng();
            setCenter({ lat: newLat, lng: newLng });
            onLocationChange(newLat, newLng);
            if (map) {
                map.panTo({ lat: newLat, lng: newLng });
                map.setZoom(14);
            }
        }
    };

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const onMarkerDragEnd = (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onLocationChange(newLat, newLng);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLat = position.coords.latitude;
                    const newLng = position.coords.longitude;
                    setCenter({ lat: newLat, lng: newLng });
                    onLocationChange(newLat, newLng);
                    if (map) {
                        map.panTo({ lat: newLat, lng: newLng });
                    }
                },
                () => {
                    alert("Error getting your location. Please check your browser permissions.");
                }
            );
        }
    };

    if (loadError || isPlaceholderKey) {
        return (
            <div className="h-[400px] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                    <MapPin size={24} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">Map Preview Unavailable</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                        The interactive map is currently in view-only mode. Search results will still be filtered by your location.
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoaded) return <div className="h-[400px] bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">Loading Map...</div>;

    return (
        <div className="relative group overflow-hidden rounded-[2rem]">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: false,
                    clickableIcons: false,
                    styles: [
                        {
                            "featureType": "poi",
                            "elementType": "labels",
                            "stylers": [{ "visibility": "off" }]
                        }
                    ]
                }}
            >
                <StandaloneSearchBox
                    onLoad={onSearchBoxLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <div className="absolute top-4 left-4 right-16 z-20">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your area (city, sector, street)..."
                                className="w-full bg-white/90 backdrop-blur-md px-12 py-4 rounded-2xl shadow-2xl border border-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-sm font-bold placeholder:text-gray-400 transition-all"
                            />
                        </div>
                    </div>
                </StandaloneSearchBox>

                <Marker
                    position={center}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                    title="Drag to select your location"
                />
                <Circle
                    center={center}
                    radius={radius * 1000} // Radius in meters
                    options={{
                        fillColor: '#059669',
                        fillOpacity: 0.1,
                        strokeColor: '#059669',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                    }}
                />
            </GoogleMap>

            <button
                onClick={handleGetCurrentLocation}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl hover:bg-white transition-all z-20 text-emerald-600 border border-white/40 active:scale-90"
                title="Use Current Location"
            >
                <FaCrosshairs size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 z-20 whitespace-nowrap animate-bounce-subtle">
                Drag marker to refine your precise location
            </div>
        </div>
    );
};

export default GoogleMapLocationSelector;
