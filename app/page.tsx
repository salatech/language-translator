"use client";
import React, { useState, useEffect } from "react";
import countries from "@/components/countries";
import { ArrowLeftRight, Volume2, Copy, Loader2, BookmarkPlus, History, Share2, Download, Moon, Sun, Heart } from "lucide-react";
import Link from "next/link";

const Home: React.FC = () => {
  // State declarations
  const [isMounted, setIsMounted] = useState(false);
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [translateFrom, setTranslateFrom] = useState("en-GB");
  const [translateTo, setTranslateTo] = useState("yo-NG");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copyStatus, setCopyStatus] = useState({ from: false, to: false });
  const [recentTranslations, setRecentTranslations] = useState<
    Array<{ text: string; translation: string; from: string; to: string; date: string }>
  >([]);
  const [favorites, setFavorites] = useState<
    Array<{ text: string; translation: string; from: string; to: string }>
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [streakCount, setStreakCount] = useState(1);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState("translate");
  const [phrasebookCategories] = useState([
    { id: "greetings", name: "Greetings", phrases: ["Hello", "How are you?", "Thank you", "You're welcome", "Goodbye"] },
    { id: "travel", name: "Travel", phrases: ["Where is the bathroom?", "How much does this cost?", "I need help", "Where is the hotel?", "Can you help me?"] },
    { id: "dining", name: "Dining", phrases: ["The bill please", "I'm vegetarian", "It was delicious", "Water please", "Where is a good restaurant?"] },
  ]);

  // Initial setup and local storage handling
  useEffect(() => {
    setIsMounted(true);
    const lastVisit = localStorage.getItem("lastVisit");
    const savedStreak = localStorage.getItem("streakCount");
    const today = new Date().toDateString();
    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const currentDate = new Date();
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        const newStreak = savedStreak ? parseInt(savedStreak) + 1 : 1;
        setStreakCount(newStreak);
        localStorage.setItem("streakCount", newStreak.toString());
      } else if (diffDays > 1) {
        setStreakCount(1);
        localStorage.setItem("streakCount", "1");
      } else {
        setStreakCount(savedStreak ? parseInt(savedStreak) : 1);
      }
    }
    localStorage.setItem("lastVisit", today);
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const savedRecent = localStorage.getItem("recentTranslations");
    if (savedRecent) setRecentTranslations(JSON.parse(savedRecent));
    const userDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(userDarkMode);
  }, []);

  // Sync dark mode with local storage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Sync favorites with local storage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Sync recent translations with local storage
  useEffect(() => {
    localStorage.setItem("recentTranslations", JSON.stringify(recentTranslations));
  }, [recentTranslations]);

  // Auto-translate with debounce
  useEffect(() => {
    if (!fromText.trim()) {
      setToText("");
      return;
    }
    const debounce = setTimeout(() => handleTranslate(), 1000);
    return () => clearTimeout(debounce);
  }, [fromText, translateFrom, translateTo]);

  // Helper functions
  const handleExchange = () => {
    setFromText(toText);
    setToText(fromText);
    setTranslateFrom(translateTo);
    setTranslateTo(translateFrom);
  };

  const handleTranslate = async () => {
    if (!fromText.trim()) return;
    setIsTranslating(true);
    const chunkSize = 500;
    const chunks = [];
    for (let i = 0; i < fromText.length; i += chunkSize) {
      chunks.push(fromText.slice(i, i + chunkSize));
    }
    try {
      const translations = await Promise.all(
        chunks.map(async (chunk) => {
          const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${translateFrom}|${translateTo}`;
          const res = await fetch(apiUrl);
          const data = await res.json();
          return data.responseData.translatedText;
        })
      );
      const translatedText = translations.join(" ");
      setToText(translatedText);
      const newHistory = { text: fromText, translation: translatedText, from: translateFrom, to: translateTo, date: new Date().toISOString() };
      const exists = recentTranslations.some(
        (hist) => hist.text === fromText && hist.from === translateFrom && hist.to === translateTo
      );
      if (!exists && recentTranslations.length < 10) {
        setRecentTranslations([newHistory, ...recentTranslations]);
      } else if (!exists) {
        setRecentTranslations([newHistory, ...recentTranslations.slice(0, 9)]);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const addToFavorites = () => {
    if (!fromText.trim() || !toText.trim()) return;
    const newFavorite = { text: fromText, translation: toText, from: translateFrom, to: translateTo };
    if (!favorites.some((fav) => fav.text === fromText && fav.translation === toText)) {
      setFavorites([...favorites, newFavorite]);
    }
  };

  const handleCopy = (text: string, type: "from" | "to") => {
    navigator.clipboard.writeText(text);
    setCopyStatus((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopyStatus((prev) => ({ ...prev, [type]: false })), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  const handleClear = (type: "from" | "to" | "both") => {
    if (type === "from" || type === "both") setFromText("");
    if (type === "to" || type === "both") setToText("");
  };

  const handleShare = async () => {
    if (!fromText || !toText) return;
    const shareData = { title: "Translation", text: `${fromText}\n\n${toText}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(`${fromText}\n\n${toText}`);
        alert("Translation copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownload = () => {
    if (!fromText || !toText) return;
    const content = `Original (${Object.entries(countries).find(([code]) => code === translateFrom)?.[1] || translateFrom}):\n${fromText}\n\nTranslation (${Object.entries(countries).find(([code]) => code === translateTo)?.[1] || translateTo}):\n${toText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translation.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFromText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const getTranslationTip = () => {
    const tips = [
      "Keep sentences short for more accurate translations.",
      "Pay attention to context - some words have multiple meanings.",
      "Review your translation to catch any cultural misunderstandings.",
      "Idioms don't always translate literally between languages.",
      "For complex topics, break down your text into smaller chunks.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  // Render loading state until mounted
  if (!isMounted) {
    return <div></div>;
  }

  // Main render
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50"}`}>
      {/* Header */}
      <header className={`w-full ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-indigo-700"}`}>Translator</h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">Streak: {streakCount} day{streakCount !== 1 ? "s" : ""}</span>
                <Heart size={16} className="text-red-500" fill="red" />
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("translate")}
              className={`py-2 px-4 font-medium transition-colors ${activeTab === "translate" ? (darkMode ? "border-b-2 border-indigo-400 text-indigo-400" : "border-b-2 border-indigo-600 text-indigo-600") : (darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")}`}
            >
              Translate
            </button>
            <button
              onClick={() => setActiveTab("phrasebook")}
              className={`py-2 px-4 font-medium transition-colors ${activeTab === "phrasebook" ? (darkMode ? "border-b-2 border-indigo-400 text-indigo-400" : "border-b-2 border-indigo-600 text-indigo-600") : (darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")}`}
            >
              Phrasebook
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`py-2 px-4 font-medium transition-colors ${activeTab === "favorites" ? (darkMode ? "border-b-2 border-indigo-400 text-indigo-400" : "border-b-2 border-indigo-600 text-indigo-600") : (darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")}`}
            >
              Favorites
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4">
        <div className={`max-w-4xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6`}>
          {showTips && activeTab === "translate" && (
            <div className={`mb-6 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"} relative`}>
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowTips(false)} aria-label="Close tip">
                ×
              </button>
              <h3 className={`text-sm font-medium mb-1 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>Translation Tip of the Day:</h3>
              <p className="text-sm">{getTranslationTip()}</p>
            </div>
          )}

          {/* Translate Tab */}
          {activeTab === "translate" && (
            <>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="w-2/5">
                  <select
                    value={translateFrom}
                    onChange={(e) => setTranslateFrom(e.target.value)}
                    className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"} focus:outline-none focus:ring-2`}
                  >
                    {Object.entries(countries).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleExchange} className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-indigo-100 hover:bg-indigo-200"} transition-colors`} aria-label="Exchange languages">
                  <ArrowLeftRight size={20} className={darkMode ? "text-indigo-400" : "text-indigo-700"} />
                </button>
                <div className="w-2/5">
                  <select
                    value={translateTo}
                    onChange={(e) => setTranslateTo(e.target.value)}
                    className={`w-full p-2 rounded-md border ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"} focus:outline-none focus:ring-2`}
                  >
                    {Object.entries(countries).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Upload a text file to translate</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`flex flex-col rounded-lg border overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
                  <div className={`p-2 flex items-center justify-between border-b ${darkMode ? "bg-gray-700 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                    <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Original Text</span>
                    <button onClick={() => handleClear("from")} className={`${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`} disabled={!fromText} aria-label="Clear text">
                      <span className="text-xs">Clear</span>
                    </button>
                  </div>
                  <textarea
                    className={`w-full p-4 text-lg resize-none outline-none min-h-64 flex-grow ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
                    placeholder="Enter text to translate..."
                    value={fromText}
                    onChange={(e) => setFromText(e.target.value)}
                  />
                  <div className={`p-2 flex items-center justify-end space-x-3 border-t ${darkMode ? "bg-gray-700 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                    <button
                      onClick={() => handleSpeak(fromText, translateFrom)}
                      disabled={!fromText}
                      className={`p-1 rounded ${darkMode ? (!fromText ? "text-gray-500" : "text-gray-300 hover:bg-gray-600") : (!fromText ? "text-gray-400" : "text-gray-700 hover:bg-gray-200")}`}
                      aria-label="Speak text"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      onClick={() => handleCopy(fromText, "from")}
                      disabled={!fromText}
                      className={`p-1 rounded flex items-center ${darkMode ? (!fromText ? "text-gray-500" : "text-gray-300 hover:bg-gray-600") : (!fromText ? "text-gray-400" : "text-gray-700 hover:bg-gray-200")}`}
                      aria-label="Copy text"
                    >
                      <Copy size={18} />
                      {copyStatus.from && <span className="text-xs ml-1 text-green-500">Copied!</span>}
                    </button>
                  </div>
                </div>

                <div className={`flex flex-col rounded-lg border overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
                  <div className={`p-2 flex items-center justify-between border-b ${darkMode ? "bg-gray-700 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                    <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Translation</span>
                    <div className="flex items-center space-x-2">
                      {isTranslating && <Loader2 size={16} className="animate-spin text-indigo-500" />}
                      {isTranslating && <span className="text-xs text-indigo-500">Translating...</span>}
                    </div>
                  </div>
                  <textarea
                    className={`w-full p-4 text-lg resize-none outline-none min-h-64 flex-grow ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"}`}
                    placeholder="Translation will appear here..."
                    value={toText}
                    readOnly
                  />
                  <div className={`p-2 flex items-center justify-end space-x-3 border-t ${darkMode ? "bg-gray-700 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                    <button
                      onClick={() => handleSpeak(toText, translateTo)}
                      disabled={!toText}
                      className={`p-1 rounded ${darkMode ? (!toText ? "text-gray-500" : "text-gray-300 hover:bg-gray-600") : (!toText ? "text-gray-400" : "text-gray-700 hover:bg-gray-200")}`}
                      aria-label="Speak translation"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      onClick={() => handleCopy(toText, "to")}
                      disabled={!toText}
                      className={`p-1 rounded flex items-center ${darkMode ? (!toText ? "text-gray-500" : "text-gray-300 hover:bg-gray-600") : (!toText ? "text-gray-400" : "text-gray-700 hover:bg-gray-200")}`}
                      aria-label="Copy translation"
                    >
                      <Copy size={18} />
                      {copyStatus.to && <span className="text-xs ml-1 text-green-500">Copied!</span>}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={addToFavorites}
                  disabled={!fromText || !toText}
                  className={`p-2 rounded-lg flex items-center justify-center ${!fromText || !toText ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400") : (darkMode ? "bg-indigo-800 text-white hover:bg-indigo-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200")}`}
                >
                  <BookmarkPlus size={18} className="mr-2" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleShare}
                  disabled={!fromText || !toText}
                  className={`p-2 rounded-lg flex items-center justify-center ${!fromText || !toText ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400") : (darkMode ? "bg-indigo-800 text-white hover:bg-indigo-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200")}`}
                >
                  <Share2 size={18} className="mr-2" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!fromText || !toText}
                  className={`p-2 rounded-lg flex items-center justify-center ${!fromText || !toText ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400") : (darkMode ? "bg-indigo-800 text-white hover:bg-indigo-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200")}`}
                >
                  <Download size={18} className="mr-2" />
                  <span>Download</span>
                </button>
              </div>

              <div className={`p-4 rounded-lg cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`} onClick={() => setShowHistory(!showHistory)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History size={18} className="mr-2" />
                    <h3 className="text-sm font-medium">Recent Translations</h3>
                  </div>
                  <span>{showHistory ? "−" : "+"}</span>
                </div>
                {showHistory && recentTranslations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {recentTranslations.map((hist, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm cursor-pointer ${darkMode ? "bg-gray-800 hover:bg-gray-900 border border-gray-700" : "bg-white hover:bg-indigo-50 border border-gray-200"}`}
                        onClick={() => {
                          setFromText(hist.text);
                          setToText(hist.translation);
                          setTranslateFrom(hist.from);
                          setTranslateTo(hist.to);
                        }}
                      >
                        <div className="font-medium">{hist.text}</div>
                        <div className="text-xs text-gray-500">
                          {Object.entries(countries).find(([code]) => code === hist.from)?.[1] || hist.from} → {Object.entries(countries).find(([code]) => code === hist.to)?.[1] || hist.to}
                        </div>
                        <div className="text-sm">{hist.translation}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showHistory && recentTranslations.length === 0 && <p className="mt-3 text-sm text-gray-500">No recent translations yet.</p>}
              </div>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !fromText.trim()}
                className={`w-full mt-6 p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "focus:ring-indigo-400" : "focus:ring-indigo-500"} font-medium flex items-center justify-center ${isTranslating || !fromText.trim() ? (darkMode ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-300 text-gray-500 cursor-not-allowed") : (darkMode ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-indigo-600 text-white hover:bg-indigo-700")}`}
              >
                {isTranslating ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </>
          )}

          {/* Phrasebook Tab */}
          {activeTab === "phrasebook" && (
            <div>
              <h2 className={`text-xl font-medium mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Common Phrases</h2>
              <p className="text-sm mb-4">Click on any phrase to translate it instantly</p>
              <div className="space-y-6">
                {phrasebookCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <h3 className={`text-lg font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.phrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${darkMode ? "bg-gray-700 hover:bg-gray-600 border border-gray-600" : "bg-white hover:bg-indigo-50 border border-gray-200 shadow-sm"}`}
                          onClick={() => {
                            setFromText(phrase);
                            setActiveTab("translate");
                          }}
                        >
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <h2 className={`text-xl font-medium mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Saved Translations</h2>
              {favorites.length === 0 ? (
                <div className={`p-6 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <p className="mb-2">You haven’t saved any translations yet.</p>
                  <p className="text-sm">Translate something and click the Save button to add it here for quick access later.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg cursor-pointer ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-indigo-50 border border-gray-200"}`}
                      onClick={() => {
                        setFromText(fav.text);
                        setToText(fav.translation);
                        setTranslateFrom(fav.from);
                        setTranslateTo(fav.to);
                        setActiveTab("translate");
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {Object.entries(countries).find(([code]) => code === fav.from)?.[1] || fav.from}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites(favorites.filter((_, i) => i !== index));
                          }}
                          className={`text-xs ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Remove
                        </button>
                      </div>
                      <p className={`mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>{fav.text}</p>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {Object.entries(countries).find(([code]) => code === fav.to)?.[1] || fav.to}
                        </span>
                      </div>
                      <p className={`mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>{fav.translation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer
        className={`w-full p-4 text-center ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600"
        } shadow-inner`}
      >
        <p className="text-sm">© {new Date().getFullYear()} <a href="https://www.github.com/salatech" className="text-blue-500 font-extrabold" >Salatech</a>.  All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;