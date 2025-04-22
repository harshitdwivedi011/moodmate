import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const moodOptions = [
  { icon: "😊", color: "bg-yellow-300", value: "Happy" },
  { icon: "😐", color: "bg-yellow-600", value: "Neutral" },
  { icon: "😟", color: "bg-blue-300", value: "Sad" },
  { icon: "😡", color: "bg-red-300", value: "Angry" },
  { icon: "🤢", color: "bg-green-300", value: "Sick" },
];

const getMoodColor = (mood) => {
  const found = moodOptions.find((m) => m.value === mood);
  return found ? found.color : "";
};

const App = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [weather, setWeather] = useState(null);
  const [date, setDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [filterMode, setFilterMode] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("entries")) || [];
    setEntries(stored);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=15e6ef34723c51fc065948cb7d0dcb0d&units=metric`
      );
      const data = await res.json();
      setWeather({ temp: data.main.temp, condition: data.weather[0].main });
    });
  }, []);

  const saveEntry = () => {
    if (!selectedMood || !note.trim()) {
      alert("Please select mood and write a note.");
      return;
    }
    const newEntry = {
      date: date.toDateString(),
      mood: selectedMood,
      note,
      weather,
    };
    const updated = [
      ...entries.filter((e) => e.date !== newEntry.date),
      newEntry,
    ];
    setEntries(updated);
    sessionStorage.setItem("entries", JSON.stringify(updated));
    setNote("");
    setSelectedMood(null);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const entry = entries.find(
        (e) => new Date(e.date).toDateString() === date.toDateString()
      );
      return entry ? `rounded-full ${getMoodColor(entry.mood)}` : null;
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const entry = entries.find(
      (e) => new Date(e.date).toDateString() === date.toDateString()
    );

    if (!entry) return null;

    return (
      <div className="relative w-full h-full">
        <span
          className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 rounded-full ${getMoodColor(
            entry.mood
          )}`}
        ></span>
      </div>
    );
  };

  const filteredEntries = filterMode
    ? entries.filter((e) => e.mood === filterMode)
    : entries;

  return (
    <div
      className={`min-h-screen w-screen overflow-x-hidden p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-orange-50 text-black"
      }`}
    >
      <div className="flex w-full">
        <div
          className="p-6 rounded-xl w-full"
          style={{
            background: "linear-gradient(180deg, #F78E57 0%, #FCD8A9 100%)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl md:text-2xl font-bold text-white">
              MoodMate
            </h5>
            <div className="flex items-center gap-3">
              {weather && (
                <span className="text-lg font-bold text-white">
                  🌤 {Math.round(weather.temp)}℃
                </span>
              )}
              <button
                className="px-2 py-1 rounded bg-white text-black dark:bg-gray-700 dark:text-white"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? "Light ☀️" : "Dark 🌙"}
              </button>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 w-full flex flex-col lg:flex-row gap-6"
            style={{
              background:
                "linear-gradient(180deg,rgb(241, 204, 184) 0%,rgb(229, 221, 212) 100%)",
            }}
          >
            {/* Left Section */}
            <div className="w-full">
              <p className="text-xl font-semibold mb-2 text-center">
                {date.toDateString()}
              </p>
              <p className="mb-2 text-lg text-center">
                How are you feeling today?
              </p>
              <div className="flex gap-3 flex-wrap justify-center mb-4">
                {moodOptions.map((m) => (
                  <button
                    style={{ fontSize: "2rem" }}
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    className={`flex items-center justify-center transition-transform duration-150 text-2xl ${
                      selectedMood === m.value
                        ? "scale-110 ring-2 ring-white"
                        : ""
                    } ${m.color}`}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 resize-none"
              />
              <button
                onClick={saveEntry}
                className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white py-2 rounded transition"
                style={{ background: "#F78E57" }}
              >
                Save
              </button>
            </div>

            {/* Calendar Section */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold text-center">April</p>
                <div className="relative">
  <button
    onClick={() => setShowFilterMenu((prev) => !prev)}
    className="bg-gray-200 p-2 rounded"
  >
    <span className="text-lg">🔽</span>
  </button>

  {showFilterMenu && (
    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
      <button
        onClick={() => {
          setFilterMode(null);
          setShowFilterMenu(false);
        }}
        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
      >
        Show All
      </button>
      {moodOptions.map((mood) => (
        <button
          key={mood.value}
          onClick={() => {
            setFilterMode(mood.value);
            setShowFilterMenu(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
        >
          <span>{mood.icon}</span>
          <span>{mood.value.charAt(0).toUpperCase() + mood.value.slice(1)}</span>
        </button>
      ))}
    </div>
  )}
</div>
              </div>
              <Calendar
                value={date}
                onChange={setDate}
                tileClassName={tileClassName}
                tileContent={tileContent}
                className="calendar w-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-center px-2 py-2 " style={{ background: "#F78E57" }}>{filterMode ? `${filterMode} Moods` : "All Notes"}</h2>
        {filterMode && (
  <p className="text-sm mb-2 italic">
    Filtering by mood: <strong>{filterMode}</strong>{" "}
    <button
      onClick={() => setFilterMode(null)}
      className="ml-2 text-blue-500 hover:underline"
    >
      Clear
    </button>
  </p>
)}
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEntries.map((e) => (
            <div
              key={e.date}
              className="p-3 rounded shadow bg-orange-100 dark:bg-gray-700"
            >
              <p className="text-lg">
                {moodOptions.find((m) => m.value === e.mood)?.icon}
              </p>
              <p className="font-medium">{e.note}</p>
              <div className="flex justify-between">
              <p className="text-sm">{e.date}</p>
              <p className="text-sm italic">{e.weather?.temp}℃</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
