"use client";
import React, { useState } from "react";
import Image from "next/image";

// Helper: Map weather codes to icons and backgrounds (simplified)
const weatherVisuals = {
  Clear: { icon: "./sunny.svg", bg: "from-yellow-200 to-blue-400" },
  Clouds: { icon: "./cloudy.svg", bg: "from-gray-300 to-blue-500" },
  Rain: { icon: "./rainy.svg", bg: "from-blue-400 to-gray-600" },
  Drizzle: { icon: "./rainy.svg", bg: "from-blue-300 to-gray-500" },
  Thunderstorm: { icon: "./storm.svg", bg: "from-gray-700 to-blue-900" },
  Snow: { icon: "./snowy.svg", bg: "from-blue-100 to-blue-400" },
  Mist: { icon: "./mist.svg", bg: "from-gray-200 to-gray-400" },
  Smoke: { icon: "./mist.svg", bg: "from-gray-300 to-gray-500" },
  Haze: { icon: "./mist.svg", bg: "from-gray-200 to-yellow-200" },
  Fog: { icon: "./mist.svg", bg: "from-gray-300 to-gray-500" },
  default: { icon: "./cloudy.svg", bg: "from-gray-200 to-blue-300" },
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
  // Add more fields if needed
};

// Type for hourly forecast
type HourlyForecast = {
  time: string;
  icon: string;
  temp: number;
  cond: string;
};

declare global {
  interface Window {
    OPENWEATHER_API_KEY?: string;
  }
}
const API_KEY = "0f0d7f0e9b7e6484354169898589100f"

export default function Home() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  // For fade transition
  const [fade, setFade] = useState<'in' | 'out'>('in');
  const [weatherKey, setWeatherKey] = useState(0);
  // For background fade
  const [prevBg, setPrevBg] = useState<string>("");
  const [bgFade, setBgFade] = useState<'in' | 'out'>('in');

  // Fetch weather by city with fade transition
  async function fetchWeather(cityName: string, units = unit) {
    setLoading(true);
    setError("");
    setFade('out');
    setBgFade('out');
    setPrevBg(bg); // Save current bg before change
    setQuery("");
    setTimeout(async () => {
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
        const hourlyArr: HourlyForecast[] = [];
        (fData.list as ForecastListItem[]).forEach((item, idx) => {
          // Hourly forecast: next 12 hours (API returns every 3 hours)
          if (idx < 12) {
            const date = new Date(item.dt * 1000);
            const hour = date.getHours().toString().padStart(2, "0");
            // const min = date.getMinutes().toString().padStart(2, "0");
            const time = `${hour}:00`;
            const cond = item.weather[0].main;
            hourlyArr.push({
              time,
              icon: weatherVisuals[cond as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon,
              temp: Math.round(item.main.temp),
              cond,
            });
          }
          const day = formatDay(item.dt);
          if (!daily[day]) daily[day] = [];
          daily[day].push(item);
        });
        setHourly(hourlyArr);
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
        setWeatherKey((k) => k + 1); // Change key to trigger transition
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
      setTimeout(() => {
        setFade('in');
        setBgFade('in');
      }, 50); // Fade in after data loads
    }, 200); // Fade out duration
  }

  // Fetch weather by geolocation with fade transition
  async function fetchByLocation() {
    setLoading(true);
    setError("");
    setFade('out');
    setBgFade('out');
    setPrevBg(bg); // Save current bg before change
    setQuery("");
    setTimeout(() => {
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
            // Group by day and hourly (next 12)
            const daily: Record<string, ForecastListItem[]> = {};
            const hourlyArr: HourlyForecast[] = [];
            (fData.list as ForecastListItem[]).forEach((item, idx) => {
              // Hourly forecast: next 12 hours (API returns every 3 hours)
              if (idx < 12) {
                const date = new Date(item.dt * 1000);
                const hour = date.getHours().toString().padStart(2, "0");
                const time = `${hour}:00`;
                const cond = item.weather[0].main;
                hourlyArr.push({
                  time,
                  icon: weatherVisuals[cond as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon,
                  temp: Math.round(item.main.temp),
                  cond,
                });
              }
              const day = formatDay(item.dt);
              if (!daily[day]) daily[day] = [];
              daily[day].push(item);
            });
            setHourly(hourlyArr);
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
            setWeatherKey((k) => k + 1); // Change key to trigger transition
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
          setTimeout(() => {
            setFade('in');
            setBgFade('in');
          }, 50); // Fade in after data loads
        },
        () => {
          setError("Location access denied");
          setLoading(false);
          setTimeout(() => {
            setFade('in');
            setBgFade('in');
          }, 50);
        }
      );
    }, 200); // Fade out duration
  }

  // °C/°F toggle
  function toggleUnit() {
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));
    if (city) fetchWeather(city, unit === "metric" ? "imperial" : "metric");
  }

  // Autocomplete: show history
  React.useEffect(() => {
    async function loadCities() {
      // Only load if not already loaded and query is not empty
      if (allCities.length === 0 && query) {
        try {
          const res = await fetch('world-cities.csv');
          const text = await res.text();
      // Assume CSV format: first line is header, then city,state,country in columns
      const lines = text.split('\n');
      // Remove header
      const cities = lines.slice(1)
        .map(line => {
          const [city, country, state] = line.split(',').map(s => s?.trim() || "");
          if (!city) return null;
          // If state is empty, skip it in display
          return state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
        });
      setAllCities(cities.filter((c): c is string => !!c));
        } catch {
          // Fail silently, fallback to empty
          setAllCities([]);
        }
      }
    }
    loadCities();
  }, [query]);

  const filteredHistory = query
    ? (allCities.length > 0
        ? allCities.filter((c) => c.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
        : history.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  // Dynamic background based on local time and weather
  function getLocalHour(weather: WeatherResponse | null) {
    if (!weather) return null;
    // OpenWeatherMap returns timezone offset in seconds
    // If not available, fallback to UTC
    const nowUTC = new Date();
    // Add timezone to WeatherResponse type
    const offset = (weather as WeatherResponse & { timezone?: number }).timezone ?? 0; // seconds
    const localTime = new Date(nowUTC.getTime() + offset * 1000);
    return localTime.getHours();
  }

  function getBg(weather: WeatherResponse | null) {
    if (!weather) return weatherVisuals.default.bg;
    const hour = getLocalHour(weather);
    const isNight = hour !== null && (hour < 6 || hour > 18);
    const cond = weather.weather[0].main as keyof typeof weatherVisuals;
    // Night backgrounds
    if (isNight) {
      if (cond === "Clear") return "from-blue-900 to-black";
      if (cond === "Clouds") return "from-gray-700 to-black";
      if (cond === "Rain" || cond === "Drizzle") return "from-gray-800 to-blue-900";
      if (cond === "Thunderstorm") return "from-gray-900 to-black";
      if (cond === "Snow") return "from-blue-800 to-gray-300";
      if (cond === "Mist" || cond === "Fog" || cond === "Smoke" || cond === "Haze") return "from-gray-800 to-gray-900";
      return "from-gray-900 to-black";
    }
    // Day backgrounds
    return weatherVisuals[cond]?.bg || weatherVisuals.default.bg;
  }

  const bg = getBg(weather);

  // AI message
  const ai = weather
    ? getAIMessages(Math.round(weather.main.temp), weather.weather[0].description)
    : { message: "", tip: "" };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-2 py-6 sm:py-10 lg:px-8 lg:py-16 xl:px-16 xl:py-20 2xl:px-32 2xl:py-24 overflow-hidden">
      {/* Background crossfade layer */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-700 bg-gradient-to-br ${prevBg} pointer-events-none`}
        style={{ opacity: bgFade === 'in' ? 0 : 1 }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-700 bg-gradient-to-br ${bg} pointer-events-none`}
        style={{ opacity: bgFade === 'in' ? 1 : 0 }}
        aria-hidden="true"
      />
      <main className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl bg-white/80 dark:bg-black/60 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-10 xl:p-16 2xl:p-20 flex flex-col gap-6 items-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-2 tracking-tight">Weather Assistant</h1>
        {/* Search bar */}
        <form
          className="flex w-full gap-2 lg:gap-4 xl:gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (query) fetchWeather(query);
          }}
        >
          <div className="relative w-full">
            <input
              className="flex-1 w-full rounded-l-lg px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900"
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {/* Custom dropdown for autocomplete */}
            {filteredHistory.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto">
                {filteredHistory.map((c) => (
                  <li
                    key={c}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-800 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                    onMouseDown={() => setQuery(c)}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative group">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-r-lg transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              aria-label="Search"
            >
              <span role="img" aria-label="search">🔍</span>
            </button>
            {/* Tooltip for search button */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-14 w-48 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20">
              Search for a city by name.
            </div>
          </div>
          <div className="relative group">
            <button
              type="button"
              className="ml-1 sm:ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-lg transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              onClick={fetchByLocation}
              aria-label="Use current location"
            >
              <span role="img" aria-label="location">📍</span>
            </button>
            {/* Tooltip for location button */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-14 w-48 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20">
              Use your current location to get weather data.
            </div>
          </div>
        </form>
        {/* Error */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {/* Loading */}
        {loading && <div className="text-blue-600 text-sm animate-pulse">Loading...</div>}
        {/* Weather card, hourly, and forecast with fade transition */}
        <div
          key={weatherKey}
          className={`w-full transition-opacity duration-300 ${fade === 'in' ? 'opacity-100' : 'opacity-0'}`}
        >
        {weather && (
          <div className="flex flex-col items-center gap-2 lg:gap-4 xl:gap-6 animate-fade-in">
            <div className="flex items-center gap-3 lg:gap-6 xl:gap-8">
                {/* Weather icon */}
                <Image
                  src={weatherVisuals[weather.weather[0].main as keyof typeof weatherVisuals]?.icon || weatherVisuals.default.icon}
                  alt={weather.weather[0].main}
                  width={48}
                  height={48}
                  className="drop-shadow"
                  style={{ width: typeof window !== 'undefined' && window.innerWidth < 200 ? 24 : 48, height: typeof window !== 'undefined' && window.innerWidth < 200 ? 24 : 48 }}
                />
                <span className="text-xl font-semibold">{city}</span>
              </div>
              <div className="flex items-center gap-2 text-3xl lg:text-5xl xl:text-6xl font-bold relative">
                <span style={{ color: 'var(--temperature-number-color)' }}>{Math.round(weather.main.temp)}°</span>
                {/* Toggle Switch Button */}
                <div className="ml-1 relative group">
                  <button
                    onClick={toggleUnit}
                    className={
                      `w-20 h-10 flex items-center rounded-full px-0 transition-colors duration-300 relative ` +
                      (unit === "metric" ? "bg-blue-200" : "bg-yellow-200")
                    }
                    aria-label="Toggle °C/°F"
                    style={{ color: 'var(--temperature-color)' }}
                  >
                    <span className={`w-1/2 text-center text-lg font-semibold transition-colors duration-300 z-10 ${unit === "metric" ? "text-blue-700" : "text-gray-500"}`}>C</span>
                    <span className={`w-1/2 text-center text-lg font-semibold transition-colors duration-300 z-10 ${unit === "imperial" ? "text-yellow-700" : "text-gray-500"}`}>F</span>
                    <span
                      className={
                        `absolute top-1 left-1 w-8 h-8 rounded-full shadow transition-transform duration-300 bg-white border border-gray-300 ` +
                        (unit === "metric" ? "translate-x-0" : "translate-x-10")
                      }
                      style={{ pointerEvents: 'none', opacity: 0.6 }}
                    />
                  </button>
                  {/* Info card on hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-14 w-48 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20">
                    Toggle between Celsius and Fahrenheit units for temperature display.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-lg lg:text-2xl xl:text-3xl capitalize">
                <span>{weather.weather[0].description}</span>
              </div>
              <div className="flex gap-4 lg:gap-8 xl:gap-12 text-sm lg:text-lg xl:text-xl text-gray-700 dark:text-gray-300">
                <span>💨 Wind: {Math.round(weather.wind.speed)} {unit === "metric" ? "m/s" : "mph"}</span>
                <span>💧 Humidity: {weather.main.humidity}%</span>
              </div>
              {/* AI message */}
              <div className="w-full bg-blue-50 dark:bg-blue-900/40 rounded-lg p-3 lg:p-6 xl:p-8 mt-2 text-center text-blue-900 dark:text-blue-100 animate-fade-in">
                <div className="font-medium">{ai.message}</div>
                <div className="text-sm mt-1">{ai.tip}</div>
              </div>
            </div>
          )}
          {/* Hourly forecast */}
          {hourly.length > 0 && (
            <div className="w-full mt-2 lg:mt-4 xl:mt-6">
              <div className="font-semibold mb-2 lg:text-lg xl:text-xl">Hourly Forecast (Next 12 Hours):</div>
              <div className="flex gap-2 lg:gap-4 xl:gap-6 overflow-x-auto pb-2 forecast-scroll">
                {hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center bg-white/70 dark:bg-black/40 rounded-xl shadow p-2 lg:p-4 xl:p-6 min-w-[60px] lg:min-w-[80px] xl:min-w-[100px] animate-fade-in"
                  >
                    <div className="text-xs lg:text-sm xl:text-base font-medium mb-1">{h.time}</div>
                    <Image src={h.icon} alt={h.cond} width={24} height={24} style={{ width: typeof window !== 'undefined' && window.innerWidth < 200 ? 12 : 24, height: typeof window !== 'undefined' && window.innerWidth < 200 ? 12 : 24 }} />
                    <div className="text-xs lg:text-sm xl:text-base mt-1">{h.cond}</div>
                    <div className="text-base lg:text-xl xl:text-2xl font-bold mt-1">{h.temp}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 5-day forecast */}
          {forecast.length > 0 && (
            <div className="w-full mt-2 lg:mt-4 xl:mt-6">
              <div className="font-semibold mb-2 lg:text-lg xl:text-xl">5-Day Forecast:</div>
              <div className="flex gap-2 lg:gap-4 xl:gap-6 overflow-x-auto pb-2 forecast-scroll">
                {forecast.map((f) => (
                  <div
                    key={f.day}
                    className="flex flex-col items-center bg-white/70 dark:bg-black/40 rounded-xl shadow p-3 lg:p-5 xl:p-8 min-w-[80px] lg:min-w-[100px] xl:min-w-[120px] animate-fade-in"
                  >
                    <div className="text-sm lg:text-base xl:text-lg font-medium mb-1">{f.day}</div>
                    <Image src={f.icon} alt={f.cond} width={32} height={32} style={{ width: typeof window !== 'undefined' && window.innerWidth < 200 ? 16 : 32, height: typeof window !== 'undefined' && window.innerWidth < 200 ? 16 : 32 }} />
                    <div className="text-xs lg:text-sm xl:text-base mt-1">{f.cond}</div>
                    <div className="text-base lg:text-xl xl:text-2xl font-bold mt-1">{f.max}°</div>
                    <div className="text-xs lg:text-sm xl:text-base text-gray-500">{f.min}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-8 text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-300 text-center">
        Powered by OpenWeatherMap. &copy; {new Date().getFullYear()}<br />
        <span className="opacity-70">AI suggestions are for informational purposes only.</span>
      </footer>
    </div>
  );
}

console.log("API KEY:", API_KEY); // For debugging, remove in production