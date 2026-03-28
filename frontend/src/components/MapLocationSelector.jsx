import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaCrosshairs, FaSearch } from 'react-icons/fa';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to handle map clicks for changing location
const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// A component to recenter the map when center changes externally
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapLocationSelector = ({ lat, lng, radius, onLocationChange }) => {
    const defaultCenter = [28.6139, 77.2090];
    const mapCenter = lat && lng ? [lat, lng] : defaultCenter;
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const newLat = parseFloat(data[0].lat);
                    const newLng = parseFloat(data[0].lon);
                    onLocationChange(newLat, newLng);
                }
            } catch (err) {
                console.error("Geocoding error:", err);
            }
        }
    };

    const handleLocationSelect = (newLat, newLng) => {
        onLocationChange(newLat, newLng);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onLocationChange(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    alert("Error getting your location. Please check your browser permissions.");
                }
            );
        }
    };

    return (
        <div className="relative group overflow-hidden rounded-[2rem] h-[400px]">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                    position={mapCenter} 
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            onLocationChange(position.lat, position.lng);
                        }
                    }}
                />
                <Circle
                    center={mapCenter}
                    radius={radius * 1000} // Radius in meters
                    pathOptions={{
                        fillColor: '#059669',
                        fillOpacity: 0.1,
                        color: '#059669',
                        opacity: 0.8,
                        weight: 2,
                    }}
                />
                <MapEvents onLocationSelect={handleLocationSelect} />
                <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} />
            </MapContainer>

            <div className="absolute top-4 left-4 right-16 z-[400]">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search your area (city, sector, street) and press Enter..."
                        className="w-full bg-white/90 backdrop-blur-md px-12 py-4 rounded-2xl shadow-2xl border border-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-sm font-bold placeholder:text-gray-400 transition-all"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl hover:bg-white transition-all z-[400] text-emerald-600 border border-white/40 active:scale-90"
                title="Use Current Location"
            >
                <FaCrosshairs size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 z-[400] whitespace-nowrap animate-bounce-subtle">
                Drag marker or click on map to refine location
            </div>
        </div>
    );
};

export default MapLocationSelector;
