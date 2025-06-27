import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, FileText, Heart, Book } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({
    onSearch,
    data = [],
    placeholder = "Search your stories...",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        sections: [],
        hasPhotos: false,
        hasRecordings: false,
        dateRange: null
    });
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debouncedQuery = useDebounce(query, 300);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    const sections = [
        { id: 'overview', label: 'Overview', icon: Book },
        { id: 'childhood', label: 'Childhood', icon: Heart },
        { id: 'family', label: 'Family', icon: Heart },
        { id: 'career', label: 'Career', icon: FileText },
        { id: 'achievements', label: 'Achievements', icon: FileText },
        { id: 'wisdom', label: 'Wisdom', icon: Book }
    ];

    useEffect(() => {
        if (debouncedQuery) {
            const results = performSearch(debouncedQuery, data, filters);
            setSuggestions(results.slice(0, 5));
            onSearch(results);
        } else {
            setSuggestions([]);
            onSearch([]);
        }
    }, [debouncedQuery, data, filters, onSearch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = (searchQuery, searchData, searchFilters) => {
        const query = searchQuery.toLowerCase();
        const results = [];

        // Search through sections
        sections.forEach(section => {
            if (searchFilters.sections.length === 0 || searchFilters.sections.includes(section.id)) {
                const content = searchData[section.id] || '';
                if (content.toLowerCase().includes(query)) {
                    results.push({
                        type: 'section',
                        section: section.id,
                        title: section.label,
                        content: content.substring(0, 100) + '...',
                        icon: section.icon
                    });
                }
            }
        });

        // Search through memories
        if (searchData.memories) {
            searchData.memories.forEach(memory => {
                if (memory.content.toLowerCase().includes(query)) {
                    results.push({
                        type: 'memory',
                        id: memory.id,
                        title: memory.title,
                        content: memory.content.substring(0, 100) + '...',
                        icon: Heart
                    });
                }
            });
        }

        // Apply additional filters
        return results.filter(result => {
            if (searchFilters.hasPhotos && !hasPhotos(result.section || result.id)) return false;
            if (searchFilters.hasRecordings && !hasRecordings(result.section || result.id)) return false;
            return true;
        });
    };

    const hasPhotos = (sectionId) => {
        // Implementation would check if section has photos
        return false;
    };

    const hasRecordings = (sectionId) => {
        // Implementation would check if section has recordings
        return false;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSuggestionClick(suggestions[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.title);
        setIsOpen(false);
        setSelectedIndex(-1);
        // Navigate to the section/memory
        console.log('Navigate to:', suggestion);
    };

    const toggleFilter = (sectionId) => {
        setFilters(prev => ({
            ...prev,
            sections: prev.sections.includes(sectionId) ?
                prev.sections.filter(id => id !== sectionId) : [...prev.sections, sectionId]
        }));
    };

    return ( <
        div ref = { searchRef }
        className = { `relative ${className}` } > { /* Search Input */ } <
        div className = "relative" >
        <
        Search className = "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" / >
        <
        input ref = { inputRef }
        type = "text"
        value = { query }
        onChange = {
            (e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
            }
        }
        onFocus = {
            () => setIsOpen(true)
        }
        onKeyDown = { handleKeyDown }
        placeholder = { placeholder }
        className = "w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /
        >
        {
            query && ( <
                button onClick = {
                    () => {
                        setQuery('');
                        setSuggestions([]);
                        onSearch([]);
                    }
                }
                className = "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" >
                <
                X className = "h-5 w-5" / >
                <
                /button>
            )
        } <
        /div>

        { /* Filters */ } <
        div className = "mt-2 flex items-center gap-2" >
        <
        button onClick = {
            () => setIsOpen(!isOpen)
        }
        className = "flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" >
        <
        Filter className = "h-4 w-4" / >
        <
        span > Filters < /span> < /
        button >

        {
            filters.sections.length > 0 && ( <
                div className = "flex gap-1" > {
                    filters.sections.map(sectionId => {
                        const section = sections.find(s => s.id === sectionId);
                        return ( <
                            span key = { sectionId }
                            className = "inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full" > { section.label } <
                            button onClick = {
                                () => toggleFilter(sectionId)
                            }
                            className = "hover:text-blue-600" >
                            <
                            X className = "h-3 w-3" / >
                            <
                            /button> < /
                            span >
                        );
                    })
                } <
                /div>
            )
        } <
        /div>

        { /* Search Results */ } {
            isOpen && (query || filters.sections.length > 0) && ( <
                div className = "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" > {
                    suggestions.length > 0 ? ( <
                        div className = "py-2" > {
                            suggestions.map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return ( <
                                    button key = { `${suggestion.type}-${suggestion.section || suggestion.id}` }
                                    onClick = {
                                        () => handleSuggestionClick(suggestion)
                                    }
                                    className = { `w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }` } >
                                    <
                                    div className = "flex items-start gap-3" >
                                    <
                                    Icon className = "h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" / >
                                    <
                                    div className = "flex-1 min-w-0" >
                                    <
                                    div className = "font-medium text-gray-900 truncate" > { suggestion.title } <
                                    /div> <
                                    div className = "text-sm text-gray-600 truncate" > { suggestion.content } <
                                    /div> < /
                                    div > <
                                    /div> < /
                                    button >
                                );
                            })
                        } <
                        /div>
                    ) : query ? ( <
                        div className = "px-4 py-8 text-center text-gray-500" >
                        <
                        Search className = "h-8 w-8 mx-auto mb-2 text-gray-300" / >
                        <
                        p > No results found
                        for "{query}" < /p> < /
                        div >
                    ) : null
                } <
                /div>
            )
        }

        { /* Filter Panel */ } {
            isOpen && ( <
                div className = "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4" >
                <
                h3 className = "font-medium text-gray-900 mb-3" > Filter by Section < /h3> <
                div className = "grid grid-cols-2 gap-2" > {
                    sections.map(section => {
                        const Icon = section.icon;
                        return ( <
                            button key = { section.id }
                            onClick = {
                                () => toggleFilter(section.id)
                            }
                            className = { `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.sections.includes(section.id)
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }` } >
                            <
                            Icon className = "h-4 w-4" / >
                            <
                            span > { section.label } < /span> < /
                            button >
                        );
                    })
                } <
                /div> < /
                div >
            )
        } <
        /div>
    );
};

export default SearchBar;