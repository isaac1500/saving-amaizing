import React, { useState, useEffect, useRef } from 'react';
import './AutoSuggest.css';

const AutoSuggest = ({ onSelect, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (suggestion) => {
    setQuery(suggestion.fullName || suggestion.username);
    setShowSuggestions(false);
    onSelect(suggestion);
  };

  return (
    <div className="auto-suggest" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="auto-suggest-input"
      />
      {isLoading && (
        <div className="suggestions-loading">
          <div className="spinner-small"></div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.fullName} ({suggestion.username})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggest;