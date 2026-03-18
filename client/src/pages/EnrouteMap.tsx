import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress } from "../utils/geocodeAddress";
import { Marker as LeafletMarker } from "leaflet";
import { Search, Navigation, MapPin, Clock, AlertTriangle, CheckCircle } from "lucide-react";

// Fix for default marker icon in React-Leaflet
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

const EnrouteMap: React.FC = () => {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zone, setZone] = useState("");
  const [chokepoints, setChokepoints] = useState<any[]>([]);
  const [selectedChokepoint, setSelectedChokepoint] = useState<any | null>(null);
  const [assignmentResult, setAssignmentResult] = useState<any | null>(null);
  const [hasRescheduled, setHasRescheduled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError("");
    setAssignmentResult(null);
    setHasRescheduled(false);
    setSelectedChokepoint(null);

    try {
      const location = await geocodeAddress(address);
      if (!location) {
        setError("Could not find that address. Please try again.");
        setLoading(false);
        return;
      }
      setCoords(location);

      const zoneRes = await fetch(`/api/location/zone?lat=${location.lat}&lng=${location.lng}`);

      if (!zoneRes.ok) {
        if (zoneRes.status === 404) {
          setError("Delivery not available here yet. Try 'Bangalore' or 'South Dallas'.");
        } else {
          setError("Error identifying zone.");
        }
        setLoading(false);
        return;
      }

      const zoneData = await zoneRes.json();
      setZone(zoneData.zone);

      const cpRes = await fetch(`/api/chokepoints/${zoneData.zone}`);
      const cpData = await cpRes.json();
      setChokepoints(cpData);
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSlot = async (isReschedule = false) => {
    if (!selectedChokepoint) return;
    setLoading(true);

    try {
      const res = await fetch("/api/order/assign-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chokepointId: selectedChokepoint._id,
          preferredTime: isReschedule ? "" : "5–6 PM",
        }),
      });

      const result = await res.json();
      setAssignmentResult(result);
      if (isReschedule) setHasRescheduled(true);
    } catch (err) {
      setError("Failed to assign slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-100 flex flex-col md:flex-row">

      {/* Floating Control Panel */}
      <div className="w-full md:w-[400px] bg-white z-[1000] shadow-2xl flex flex-col h-1/2 md:h-full overflow-y-auto border-r border-gray-200 order-2 md:order-1">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-walmart-dark">
            <Navigation className="w-6 h-6 text-walmart-blue" />
            Find Pickup Point
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your location to find the nearest Enroute delivery points.
          </p>

          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              className="w-full pl-12 pr-14 py-4 border-2 border-transparent bg-gray-100 rounded-xl focus:bg-white focus:border-walmart-blue focus:ring-0 transition-all outline-none font-medium text-gray-700 placeholder-gray-400"
              placeholder="Enter city or address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-walmart-blue text-white px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[50px] shadow-sm"
            >
              {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Search className="w-5 h-5" />}
            </button>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {zone && !error && (
            <div className="mb-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Active Zone: {zone}
              </div>
            </div>
          )}

          {selectedChokepoint ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 animate-slide-up">
              <button
                onClick={() => setSelectedChokepoint(null)}
                className="text-xs text-blue-600 hover:underline mb-2"
              >
                ← Back to results
              </button>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{selectedChokepoint.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4" /> {selectedChokepoint.zone}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Traffic Score</span>
                  <span className={`font-semibold ${selectedChokepoint.trafficScore > 80 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedChokepoint.trafficScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedChokepoint.trafficScore > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${selectedChokepoint.trafficScore}%` }}
                  ></div>
                </div>
              </div>

              {!assignmentResult ? (
                <button
                  onClick={() => handleAssignSlot(false)}
                  disabled={loading}
                  className="w-full bg-walmart-yellow text-walmart-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
                >
                  {loading ? "Confirming..." : "Confirm Pickup Slot"}
                </button>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                    <CheckCircle className="w-5 h-5" /> Slot Confirmed!
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Location: <span className="font-semibold">{assignmentResult.point}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Time: <span className="font-semibold">{assignmentResult.time}</span>
                  </p>

                  {!hasRescheduled && (
                    <button
                      onClick={() => handleAssignSlot(true)}
                      className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {chokepoints.map((cp, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedChokepoint(cp);
                    setCoords(cp.coordinates);
                  }}
                  className="p-4 border border-gray-100 hover:border-blue-300 hover:bg-blue-50 rounded-xl cursor-pointer transition-all group animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-blue-700">{cp.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{cp.zone}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${cp.trafficScore > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {cp.trafficScore > 80 ? 'High Traffic' : 'Optimal'}
                    </div>
                  </div>
                </div>
              ))}

              {chokepoints.length === 0 && !loading && !error && zone && (
                <div className="text-center py-10 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No drop points found in this zone.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-1/2 md:h-full relative order-1 md:order-2">
        {!coords ? (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center flex-col text-gray-400">
            <MapPin className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Enter a location to find pickup points</p>
          </div>
        ) : (
          <MapContainer center={coords} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            {/* User Location */}
            <Marker
              position={coords}
              draggable={true}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target;
                  const newPos = marker.getLatLng();
                  const newCoords = { lat: newPos.lat, lng: newPos.lng };
                  setCoords(newCoords);

                  const zoneRes = await fetch(`/api/location/zone?lat=${newCoords.lat}&lng=${newCoords.lng}`);
                  if (zoneRes.ok) {
                    const zoneData = await zoneRes.json();
                    setZone(zoneData.zone);
                    const cpRes = await fetch(`/api/chokepoints/${zoneData.zone}`);
                    const cpData = await cpRes.json();
                    setChokepoints(cpData);
                  }
                },
              }}
            >
              <Popup>Your Location (Drag to refine)</Popup>
            </Marker>

            {/* Chokepoints */}
            {chokepoints.map((cp, idx) => (
              <Marker
                key={idx}
                position={cp.coordinates}
                eventHandlers={{
                  click: () => setSelectedChokepoint(cp),
                }}
              >
                <Popup>
                  <strong>{cp.name}</strong>
                  <br />
                  <span className={cp.trafficScore > 80 ? 'text-red-600' : 'text-green-600'}>
                    {cp.trafficScore > 80 ? 'Heavy Traffic' : 'Smooth Traffic'}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default EnrouteMap;
