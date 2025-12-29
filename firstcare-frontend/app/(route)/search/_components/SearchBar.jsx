// app/(route)/search/_components/SearchBar.jsx
// SearchBar component to allow users to search for healthcare professionals
// Includes an input field and a search button for initiating a search action
import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  // Handle input change
  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  // Handle search action
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="flex justify-center items-center mt-6">
      <input
        type="text"
        placeholder="Search for healthcare professionals..."
        value={query}
        onChange={handleInputChange}
        className="w-1/3 h-14 pl-4 border border-[#012944] rounded-l-full outline-none"
      />
      <button
        className="bg-[#F06255] text-white px-6 h-14 rounded-r-full"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}