"use client";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ClipboardIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface MapboxFeature {
  place_name: string;
  center: [number, number];
  text: string;
}

interface AddressMapProps {
  country: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  onCoordinatesUpdate: (coordinates: { lat: number; lng: number }) => void;
  onFetchStart?: () => void;
}

export interface AddressMapHandle {
  searchAddress: () => Promise<void>;
}

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2FsbWFudG9taWthIiwiYSI6ImNtMzNiY3pvdDEwZDIya3I2NWwxanJ6cXIifQ.kiSWtgrH6X-l0TpquCKiXA";
mapboxgl.accessToken = MAPBOX_TOKEN;

const AddressMap = forwardRef<AddressMapHandle, AddressMapProps>(({ 
  country, 
  city, 
  postalCode, 
  street, 
  houseNumber, 
  onCoordinatesUpdate, 
  onFetchStart 
}, ref) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<MapboxFeature | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const mountedRef = useRef(false);

  console.log('AddressMap render', { country, city, postalCode, street, houseNumber });

  // Expose the searchAddress method to parent component
  useImperativeHandle(ref, () => ({
    searchAddress: async () => {
      await searchAddress();
    }
  }));

  const searchAddress = async () => {
    if (!mountedRef.current) {
      console.log('Search skipped - component not mounted');
      return;
    }

    if (!country || !city || !postalCode || !street || !houseNumber) {
      console.log('Missing required fields');
      return;
    }

    setIsSearching(true);
    onFetchStart?.();
    try {
      const address = `${street} ${houseNumber}, ${postalCode} ${city}, ${country}`;
      console.log('Searching for address:', address);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (!mountedRef.current) {
        console.log('Search result skipped - component not mounted');
        return;
      }

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        console.log('Found location:', feature.place_name, 'Coordinates:', feature.center);
        setSelected(feature);
        // Update coordinates in parent component
        onCoordinatesUpdate({
          lat: feature.center[1],
          lng: feature.center[0]
        });
      } else {
        console.log('No location found for address');
        setSelected(null);
        cleanupMap();
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      if (mountedRef.current) {
        setSelected(null);
        cleanupMap();
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    console.log('Component mount');
    mountedRef.current = true;
    return () => {
      console.log('Component unmount', { 
        hasMap: !!mapRef.current,
        hasSelected: !!selected,
        mounted: mountedRef.current 
      });
      mountedRef.current = false;
      cleanupMap();
    };
  }, []);

  const cleanupMap = () => {
    try {
      if (mapRef.current) {
        console.log('Cleaning up map instance');
        mapRef.current.remove();
        mapRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up map:', error);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      console.log('Effect skipped - component not mounted');
      return;
    }

    console.log('Second useEffect triggered', { 
      hasSelected: !!selected,
      hasMap: !!mapRef.current,
      coordinates: selected?.center 
    });

    if (!selected || !mapContainerRef.current) return;

    try {
      // Only create a new map if one doesn't exist
      if (!mapRef.current) {
        console.log('Creating new map instance');
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: selected.center,
          zoom: 15
        });

        map.on('load', () => {
          if (!mountedRef.current) {
            console.log('Map load skipped - component not mounted');
            return;
          }
          console.log('Map loaded, adding marker');
          map.addSource('places', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: selected.center
                }
              }]
            }
          });

          map.addLayer({
            id: 'places',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-color': '#4264fb',
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        });

        mapRef.current = map;
      } else {
        console.log('Updating existing map with new coordinates:', selected.center);
        // Update existing map's center and marker position
        const map = mapRef.current;
        map.flyTo({ center: selected.center });
        
        // Update the marker position
        const source = map.getSource('places') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: selected.center
              }
            }]
          });
        }
      }

      return () => {
        if (!mountedRef.current) {
          console.log('Map effect cleanup skipped - component not mounted');
          return;
        }
        console.log('Map effect cleanup');
        cleanupMap();
      };
    } catch (error) {
      console.error('Error in map effect:', error);
    }
  }, [selected]);

  return (
    <div className="mt-4">
      <div className="mb-4">
        <span className="text-sm text-red-500">
          Mielőtt feltöltöd a címet, kérlek ellenőrizd a címet a térképen.
        </span>
        <button
          onClick={searchAddress}
          disabled={isSearching || !country || !city || !postalCode || !street || !houseNumber}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors text-sm ${
            isSearching || !country || !city || !postalCode || !street || !houseNumber
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          {isSearching ? 'Keresés...' : 'Cím Ellenőrzése'}
        </button>
      </div>
      {selected && (
        <div ref={mapContainerRef} className="h-[300px] rounded-lg overflow-hidden" />
      )}
    </div>
  );
});

AddressMap.displayName = 'AddressMap';

export default AddressMap; 