import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { MapPin, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};

const LocationSearch = ({ onLocationSelect, initialLat, initialLng, initialRadius, className = '' }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Default to a central location if not provided
    const [location, setLocation] = useState({
        lat: initialLat ? parseFloat(initialLat) : 20.5937, // India center
        lng: initialLng ? parseFloat(initialLng) : 78.9629,
        radius: initialRadius ? parseInt(initialRadius) : 50
    });
    
    const [activeMapPreview, setActiveMapPreview] = useState(!!(initialLat && initialLng));
    
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    // Initial string population if we have coords but no query
    useEffect(() => {
        if (initialLat && initialLng && !query) {
            setQuery("Selected Location");
        }
    }, [initialLat, initialLng]);

    // Fetch from nominatim
    const searchLocation = async (text) => {
        if (!text || text.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`);
            const data = await res.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Geocoding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(true);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchLocation(value);
        }, 500);
    };

    const handleSelectSuggestion = (place) => {
        setQuery(place.display_name);
        setLocation({ lat: parseFloat(place.lat), lng: parseFloat(place.lon), radius: location.radius });
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveMapPreview(true);
    };

    const handleRadiusChange = (e) => {
        setLocation(prev => ({ ...prev, radius: parseInt(e.target.value) }));
    };

    const handleApply = () => {
        if (activeMapPreview) {
            onLocationSelect({ 
                lat: location.lat, 
                lng: location.lng, 
                radius: location.radius 
            });
            setShowSuggestions(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setActiveMapPreview(false);
        onLocationSelect({ lat: null, lng: null, radius: null });
    };

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition((position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                setLocation(prev => ({
                    ...prev,
                    lat: newLat,
                    lng: newLng
                }));
                // Try reverse geocoding to get a name
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
                    .then(res => res.json())
                    .then(data => {
                        setQuery(data.display_name || 'My Location');
                    }).catch(() => {
                        setQuery('My Location');
                    });
                setActiveMapPreview(true);
                setLoading(false);
            }, (error) => {
                console.error("Geolocation error:", error);
                setLoading(false);
                alert("Could not get your location. Please check browser permissions.");
            });
        }
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative flex flex-col gap-3 ${className}`}>
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search area (e.g. New York)..."
                        className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={getUserLocation}
                    className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    title="Use my current location"
                >
                    <Navigation className="w-5 h-5" />
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length > 2 || suggestions.length > 0) && (
                <div className="absolute top-[3.5rem] left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-2">
                            {suggestions.map((place) => (
                                <li
                                    key={place.place_id}
                                    onClick={() => handleSelectSuggestion(place)}
                                    className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
                                >
                                    {place.display_name}
                                </li>
                            ))}
                        </ul>
                    ) : query.length > 2 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No matching locations found</div>
                    ) : null}
                </div>
            )}

            {/* Map Preview & Radius controls */}
            {activeMapPreview && (
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800/60 p-4 rounded-xl flex flex-col gap-4 shadow-sm relative z-0">
                    <div className="h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
                        <MapContainer center={[location.lat, location.lng]} zoom={10} className="w-full h-full z-0">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap'
                            />
                            <Marker position={[location.lat, location.lng]} />
                            <Circle 
                                center={[location.lat, location.lng]} 
                                radius={location.radius * 1000} // Leaflet uses meters
                                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }}
                            />
                            <ChangeView center={[location.lat, location.lng]} />
                        </MapContainer>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Search Radius</span>
                            <span className="font-bold text-emerald-600">{location.radius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="500"
                            step="1"
                            value={location.radius}
                            onChange={handleRadiusChange}
                            className="w-full accent-emerald-600 cursor-pointer"
                        />
                    </div>
                    
                    <button
                        onClick={handleApply}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors active:scale-[0.98]"
                    >
                        Apply Location Filter
                    </button>
                </div>
            )}
        </div>
    );
};

export default LocationSearch;
