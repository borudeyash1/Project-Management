import axios from 'axios';

interface GeolocationResult {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
}

/**
 * Get geolocation data from IP address using free API
 * Uses ip-api.com (free, no API key required, 45 requests/minute)
 */
export const getLocationFromIP = async (ip: string): Promise<GeolocationResult | null> => {
    try {
        // Skip localhost IPs
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            console.log(`⚠️ Skipping localhost IP: ${ip}`);
            return null;
        }

        // Use ip-api.com free service
        const response = await axios.get(`http://ip-api.com/json/${ip}`, {
            timeout: 5000,
            params: {
                fields: 'status,message,country,city,lat,lon,timezone,regionName'
            }
        });

        if (response.data.status === 'success') {
            return {
                lat: response.data.lat,
                lng: response.data.lon,
                city: response.data.city,
                country: response.data.country,
                region: response.data.regionName,
                timezone: response.data.timezone
            };
        } else {
            console.warn(`⚠️ Geolocation failed for IP ${ip}: ${response.data.message}`);
            return null;
        }
    } catch (error: any) {
        console.error(`❌ Geolocation error for IP ${ip}:`, error.message);
        return null;
    }
};

/**
 * Batch geocode multiple IPs with rate limiting
 */
export const batchGeocodeIPs = async (
    ips: string[],
    delayMs: number = 1500 // Rate limit: ~40 requests/minute
): Promise<Map<string, GeolocationResult>> => {
    const results = new Map<string, GeolocationResult>();

    console.log(`🗺️ Geocoding ${ips.length} IP addresses...`);

    for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];

        try {
            const location = await getLocationFromIP(ip);

            if (location) {
                results.set(ip, location);
                console.log(`✅ [${i + 1}/${ips.length}] ${ip} → ${location.city}, ${location.country}`);
            } else {
                console.log(`⚠️ [${i + 1}/${ips.length}] ${ip} → No location data`);
            }

            // Rate limiting delay (except for last request)
            if (i < ips.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            console.error(`❌ Failed to geocode ${ip}:`, error);
        }
    }

    console.log(`✅ Geocoded ${results.size}/${ips.length} IP addresses`);
    return results;
};

/**
 * Alternative: Use ipapi.co (backup service)
 * Free tier: 1000 requests/day, no API key
 */
export const getLocationFromIPBackup = async (ip: string): Promise<GeolocationResult | null> => {
    try {
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return null;
        }

        const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
            timeout: 5000
        });

        if (response.data.latitude && response.data.longitude) {
            return {
                lat: response.data.latitude,
                lng: response.data.longitude,
                city: response.data.city,
                country: response.data.country_name,
                region: response.data.region,
                timezone: response.data.timezone
            };
        }

        return null;
    } catch (error: any) {
        console.error(`❌ Backup geolocation error for IP ${ip}:`, error.message);
        return null;
    }
};

export default {
    getLocationFromIP,
    batchGeocodeIPs,
    getLocationFromIPBackup
};
