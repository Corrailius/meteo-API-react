import { useState } from "react";

type Weather = {
  temperature: number;
  windSpeed: number;
};

type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

function App() {
  const [locationName, setLocationName] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather() {
    if (locationName.trim() === "") {
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          locationName
        )}&count=1`
      );

      const locationData = await locationResponse.json();

      if (!locationData.results) {
        setError("Location not found.");
        setLoading(false);
        return;
      }

      const result = locationData.results[0];

      const foundLocation: Location = {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      };

      setLocation(foundLocation);

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=temperature_2m,wind_speed_10m`
      );

      const weatherData = await weatherResponse.json();

      setWeather({
        temperature: weatherData.current.temperature_2m,
        windSpeed: weatherData.current.wind_speed_10m,
      });
    } catch {
      setError("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-sky-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Weather
        </h1>

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            placeholder="Enter a city..."
            value={locationName}
            onChange={(event) => setLocationName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                getWeather();
              }
            }}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <button
            onClick={getWeather}
            disabled={loading}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:bg-gray-400"
          >
            Search
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-500 text-center">
            {error}
          </p>
        )}

        {loading && (
          <p className="mt-8 text-gray-500 text-center">
            Loading...
          </p>
        )}

        {weather && location && (
          <section className="mt-8 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                {location.name}
              </h2>

              <p className="text-sm text-gray-500">
                {location.latitude.toFixed(2)}°,{" "}
                {location.longitude.toFixed(2)}°
              </p>
            </div>

            <div className="bg-sky-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">
                Temperature
              </p>

              <p className="text-4xl font-bold text-sky-600">
                {weather.temperature} °C
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">
                Wind
              </p>

              <p className="text-2xl font-semibold text-gray-700">
                {weather.windSpeed} km/h
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;