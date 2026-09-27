import React, { useState, useEffect, useRef } from 'react';
import { getMemberSuggestions } from '../services/autoSuggestAPI';

const AutoSuggest = ({ onMemberSelect, selectedMember, placeholder = "Search members..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Set initial value if selectedMember is provided
  useEffect(() => {
    if (selectedMember && selectedMember.fullName) {
      setQuery(selectedMember.fullName);
    }
  }, [selectedMember]);

  // Fetch suggestions from backend API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔍 AutoSuggest: Fetching suggestions for:', query);
        const results = await getMemberSuggestions(query);
        console.log('✅ AutoSuggest: Received results:', results);
        
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('❌ AutoSuggest: Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear selection if user starts typing again
    if (selectedMember && value !== selectedMember.fullName) {
      onMemberSelect(null);
    }
  };

  const handleSuggestionClick = (member) => {
    console.log('🎯 AutoSuggest: Member selected:', member);
    setQuery(member.fullName);
    setShowSuggestions(false);
    onMemberSelect(member);
  };

  const handleBlur = () => {
    // Delay hiding to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="auto-suggest-container">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="auto-suggest-input"
      />
      
      {isLoading && (
        <div className="suggestions-loading">🔍 Searching members...</div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((member) => (
            <li
              key={member.id}
              onClick={() => handleSuggestionClick(member)}
              className="suggestion-item"
            >
              <div className="member-name">{member.fullName}</div>
              <div className="member-details">
                {member.username && <span>@{member.username}</span>}
                {member.residence && <span> • {member.residence}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="no-suggestions">❌ No members found for "{query}"</div>
      )}
    </div>
  );
};

export default AutoSuggest;