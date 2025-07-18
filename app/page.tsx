
"use client";
import React, { useState } from "react";
import Image from "next/image";

// Helper: Map weather codes to icons and backgrounds (simplified)
const basePath = "/Circuit-Stream-Final-Project";
const weatherVisuals = {
  Clear: { icon: `${basePath}/sunny.svg`, bg: "from-yellow-200 to-blue-400" },
  Clouds: { icon: `${basePath}/cloudy.svg`, bg: "from-gray-300 to-blue-500" },
  Rain: { icon: `${basePath}/rainy.svg`, bg: "from-blue-400 to-gray-600" },
  Drizzle: { icon: `${basePath}/rainy.svg`, bg: "from-blue-300 to-gray-500" },
  Thunderstorm: { icon: `${basePath}/storm.svg`, bg: "from-gray-700 to-blue-900" },
  Snow: { icon: `${basePath}/snowy.svg`, bg: "from-blue-100 to-blue-400" },
  Mist: { icon: `${basePath}/mist.svg`, bg: "from-gray-200 to-gray-400" },
  Smoke: { icon: `${basePath}/mist.svg`, bg: "from-gray-300 to-gray-500" },
  Haze: { icon: `${basePath}/mist.svg`, bg: "from-gray-200 to-yellow-200" },
  Fog: { icon: `${basePath}/mist.svg`, bg: "from-gray-300 to-gray-500" },
  default: { icon: `${basePath}/cloudy.svg`, bg: "from-gray-200 to-blue-300" },
};

// Helper: AI message and tips
function getAIMessages(temp: number, condition: string) {
  let message = "";
  let tip = "";
  if (condition.includes("rain")) {
    message = "It looks like a rainy day, don’t forget your umbrella!";
    tip = "Wear waterproof shoes and a raincoat.";
  } else if (condition.includes("snow")) {
    message = "Snowy weather ahead. Dress warmly and drive safe!";
    tip = "Wear boots, gloves, and a warm coat.";
  } else if (condition.includes("clear")) {
    message = "It’s a clear day. Enjoy the sunshine!";
    tip = temp > 25 ? "Stay hydrated and wear sunscreen." : "A light jacket should be enough.";
  } else if (condition.includes("cloud")) {
    message = "Cloudy skies today.";
    tip = temp < 15 ? "Bring a sweater." : "Comfortable weather for a walk.";
  } else {
    message = "Check the weather before heading out!";
    tip = "Dress appropriately for the conditions.";
  }
  if (temp < 5) tip = "Bundle up, it’s cold!";
  if (temp > 30) tip = "It’s hot! Wear light clothes and drink water.";
  return { message, tip };
}

// Helper: Format date
function formatDay(dt: number) {
  return new Date(dt * 1000).toLocaleDateString(undefined, { weekday: "short" });
}



// Type for forecast items
type WeatherData = {
  day: string;
  icon: string;
  min: number;
  max: number;
  cond: string;
};

// Type for OpenWeatherMap weather response (partial, only used fields)
type WeatherResponse = {
  name: string;
  sys: { country: string };
  main: { temp: number; humidity: number };
  weather: { main: string; description: string }[];
  wind: { speed: number };
};

// Type for OpenWeatherMap forecast list item (partial)
type ForecastListItem = {
  dt: number;
  main: { temp: number };
  weather: { main: string; description: string }[];
};

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export default function Home() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  // Fetch weather by city
  async function fetchWeather(cityName: string, units = unit) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${units}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setCity(`${data.name}, ${data.sys.country}`);
      setHistory((h) => [data.name, ...h.filter((c) => c !== data.name)].slice(0, 5));
      // Fetch forecast
      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${units}`
      );
      const fData = await fRes.json();
      // Group by day
      const daily: Record<string, ForecastListItem[]> = {};
      (fData.list as ForecastListItem[]).forEach((item) => {
        const day = formatDay(item.dt);
        if (!daily[day]) daily[day] = [];
        daily[day].push(item);
      });
      setForecast(
        Object.entries(daily)
          .slice(0, 5)
          .map(([day, items]) => {
            const temps = items.map((i) => i.main.temp);
            const cond = items[0].weather[0].main;
            return {
              day,
              icon: weatherVisuals[cond as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon,
              min: Math.round(Math.min(...temps)),
              max: Math.round(Math.max(...temps)),
              cond,
            };
          })
      );
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  }

  // Fetch weather by geolocation
  async function fetchByLocation() {
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
          );
          if (!res.ok) throw new Error("Location not found");
          const data = await res.json();
          setWeather(data);
          setCity(`${data.name}, ${data.sys.country}`);
          setHistory((h) => [data.name, ...h.filter((c) => c !== data.name)].slice(0, 5));
          // Fetch forecast
          const fRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
          );
          const fData = await fRes.json();
      // Group by day
      const daily: Record<string, ForecastListItem[]> = {};
      (fData.list as ForecastListItem[]).forEach((item) => {
        const day = formatDay(item.dt);
        if (!daily[day]) daily[day] = [];
        daily[day].push(item);
      });
      setForecast(
        Object.entries(daily)
          .slice(0, 5)
          .map(([day, items]) => {
            const temps = items.map((i) => i.main.temp);
            const cond = items[0].weather[0].main;
            return {
              day,
              icon: weatherVisuals[cond as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon,
              min: Math.round(Math.min(...temps)),
              max: Math.round(Math.max(...temps)),
              cond,
            };
          })
      );
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError(String(e));
          }
          setWeather(null);
          setForecast([]);
        }
        setLoading(false);
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }

  // °C/°F toggle
  function toggleUnit() {
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));
    if (city) fetchWeather(city, unit === "metric" ? "imperial" : "metric");
  }

  // Autocomplete: show history
  const filteredHistory = query
    ? history.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : history;

  // Dynamic background
  const bg = weather
    ? weatherVisuals[weather.weather[0].main as keyof typeof weatherVisuals]?.bg || weatherVisuals.default.bg
    : weatherVisuals.default.bg;

  // AI message
  const ai = weather
    ? getAIMessages(Math.round(weather.main.temp), weather.weather[0].description)
    : { message: "", tip: "" };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-2 py-6 sm:py-10 transition-colors duration-700 bg-gradient-to-br ${bg}`}
    >
      <main className="w-full max-w-md bg-white/80 dark:bg-black/60 rounded-2xl shadow-xl p-6 flex flex-col gap-6 items-center animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">Weather Assistant</h1>
        {/* Search bar */}
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (query) fetchWeather(query);
          }}
        >
          <input
            className="flex-1 rounded-l-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            type="text"
            placeholder="Search city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            list="history"
            autoComplete="off"
          />
          <datalist id="history">
            {filteredHistory.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg transition-colors"
            aria-label="Search"
          >
            <span role="img" aria-label="search">🔍</span>
          </button>
          <button
            type="button"
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors"
            onClick={fetchByLocation}
            aria-label="Use current location"
          >
            <span role="img" aria-label="location">📍</span>
          </button>
        </form>
        {/* Error */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {/* Loading */}
        {loading && <div className="text-blue-600 text-sm animate-pulse">Loading...</div>}
        {/* Weather card */}
        {weather && (
          <div className="w-full flex flex-col items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-3">
              {/* Weather icon */}
              <Image
                src={weatherVisuals[weather.weather[0].main as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon}
                alt={weather.weather[0].main}
                width={48}
                height={48}
                className="drop-shadow"
              />
              <span className="text-xl font-semibold">{city}</span>
            </div>
            <div className="flex items-center gap-2 text-3xl font-bold">
              {Math.round(weather.main.temp)}°
              <button
                onClick={toggleUnit}
                className="ml-1 text-base px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Toggle °C/°F"
              >
                {unit === "metric" ? "C" : "F"}
              </button>
            </div>
            <div className="flex items-center gap-2 text-lg capitalize">
              <span>{weather.weather[0].description}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
              <span>💨 Wind: {Math.round(weather.wind.speed)} {unit === "metric" ? "m/s" : "mph"}</span>
              <span>💧 Humidity: {weather.main.humidity}%</span>
            </div>
            {/* AI message */}
            <div className="w-full bg-blue-50 dark:bg-blue-900/40 rounded-lg p-3 mt-2 text-center text-blue-900 dark:text-blue-100 animate-fade-in">
              <div className="font-medium">{ai.message}</div>
              <div className="text-sm mt-1">{ai.tip}</div>
            </div>
          </div>
        )}
        {/* 5-day forecast */}
        {forecast.length > 0 && (
          <div className="w-full mt-2">
            <div className="font-semibold mb-2">5-Day Forecast:</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {forecast.map((f) => (
                <div
                  key={f.day}
                  className="flex flex-col items-center bg-white/70 dark:bg-black/40 rounded-xl shadow p-3 min-w-[80px] animate-fade-in"
                >
                  <div className="text-sm font-medium mb-1">{f.day}</div>
                  <Image src={f.icon} alt={f.cond} width={32} height={32} />
                  <div className="text-xs mt-1">{f.cond}</div>
                  <div className="text-base font-bold mt-1">{f.max}°</div>
                  <div className="text-xs text-gray-500">{f.min}°</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="mt-8 text-xs text-gray-600 dark:text-gray-300 text-center">
        Powered by OpenWeatherMap. &copy; {new Date().getFullYear()}<br />
        <span className="opacity-60">AI suggestions are for informational purposes only.</span>
      </footer>
    </div>
  );
}

console.log("API KEY:", API_KEY); // For debugging, remove in production