import React, { useEffect, useState } from 'react';
import { MapPin, Users, Globe } from 'lucide-react';
import api from '../../services/api';

interface UserLocation {
  ip: string;
  users: Array<{
    username: string;
    email: string;
    lastLogin: Date;
  }>;
  lastSeen: Date;
  count: number;
  coordinates?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
}

interface WorldMapProps {
  isDarkMode: boolean;
}

// Sample locations for development/testing (when IPs are localhost)
const SAMPLE_LOCATIONS = [
  { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA', count: 15 },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK', count: 12 },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', count: 8 },
  { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India', count: 25 },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', count: 6 },
  { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France', count: 10 },
  { lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia', count: 7 },
  { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', count: 9 },
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', count: 11 },
  { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', count: 8 }
];

// Unified interface for rendering
interface MapPoint {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
  users?: any[];
}

const WorldMap: React.FC<WorldMapProps> = ({ isDarkMode }) => {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/user-locations');
      
      if (response?.success && response.data?.locations) {
        const locs = response.data.locations;
        
        // Check if all IPs are localhost
        const allLocalhost = locs.every((loc: UserLocation) => 
          loc.ip === '::1' || loc.ip === '127.0.0.1' || loc.ip.startsWith('192.168.')
        );

        if (allLocalhost || locs.length === 0) {
          console.log('📍 Using sample data for development');
          setUseMockData(true);
        } else {
          setLocations(locs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Convert lat/lng to SVG coordinates (simplified Mercator projection)
  const projectToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (500 - (mercN / Math.PI) * 250);
    return { x, y };
  };

  // Normalize data to MapPoint interface
  const renderLocations: MapPoint[] = useMockData 
    ? SAMPLE_LOCATIONS.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        city: loc.city,
        country: loc.country,
        count: loc.count,
        users: []
      }))
    : locations
        .filter(loc => loc.coordinates)
        .map(loc => ({
          lat: loc.coordinates!.lat,
          lng: loc.coordinates!.lng,
          city: loc.coordinates!.city || 'Unknown',
          country: loc.coordinates!.country || 'Unknown',
          count: loc.count,
          users: loc.users
        }));

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Globe className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              User Locations
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time geographic distribution
            </p>
          </div>
        </div>
        {useMockData && (
          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              📍 Sample Data (Development)
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Locations
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {renderLocations.length}
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Users
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {renderLocations.reduce((sum, loc) => sum + loc.count, 0)}
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Countries
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Set(renderLocations.map(loc => loc.country)).size}
          </p>
        </div>
      </div>

      {/* World Map */}
      <div className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-xl p-4 overflow-hidden`}>
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        >
          {/* World Map Background (simplified) */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="500"
            fill={isDarkMode ? '#1a1a1a' : '#f3f4f6'}
          />
          
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2="500"
              stroke={isDarkMode ? '#2a2a2a' : '#e5e7eb'}
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 100}
              x2="1000"
              y2={i * 100}
              stroke={isDarkMode ? '#2a2a2a' : '#e5e7eb'}
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Location Markers */}
          {renderLocations.map((location, index) => {
            const coords = projectToSVG(location.lat, location.lng);
            const size = Math.min(30, Math.max(10, location.count * 1.5));
            const isHovered = hoveredLocation === index;

            return (
              <g
                key={index}
                onMouseEnter={() => setHoveredLocation(index)}
                onMouseLeave={() => setHoveredLocation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse animation */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size}
                  fill="#3b82f6"
                  opacity="0.2"
                  className="animate-ping"
                />
                
                {/* Main marker */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size / 2}
                  fill="#3b82f6"
                  opacity="0.8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                
                {/* Count label */}
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {location.count}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={coords.x + 20}
                      y={coords.y - 40}
                      width="150"
                      height="60"
                      fill={isDarkMode ? '#1f2937' : 'white'}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                      rx="8"
                    />
                    <text
                      x={coords.x + 30}
                      y={coords.y - 20}
                      fill={isDarkMode ? '#e5e7eb' : '#1a1a1a'}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {location.city}
                    </text>
                    <text
                      x={coords.x + 30}
                      y={coords.y - 5}
                      fill={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize="10"
                    >
                      {location.country}
                    </text>
                    <text
                      x={coords.x + 30}
                      y={coords.y + 10}
                      fill={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize="10"
                    >
                      {location.count} users
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Active Location
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 opacity-20"></div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Activity Radius
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
