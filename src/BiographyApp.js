import React, { useState, useEffect, useRef } from 'react';
import {
    Book,
    Camera,
    Mic,
    MicOff,
    Play,
    Heart,
    Plus,
    Calendar,
    FileText,
    Download,
    Save,
    Search,
    Sun,
    Moon,
    Image,
    Clock,
    Lightbulb,
    Sparkles
} from 'lucide-react';

const BiographyApp = () => {
    const [formData, setFormData] = useState({
        name: '',
        overview: '',
        childhood: '',
        family: '',
        career: '',
        achievements: '',
        wisdom: '',
        memories: [],
        timeline: []
    });

    const [currentSection, setCurrentSection] = useState('overview');
    const [photos, setPhotos] = useState({});
    const [recordings, setRecordings] = useState({});
    const [isRecording, setIsRecording] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showBookView, setShowBookView] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
    const [searchTerm, setSearchTerm] = useState('');
    const [readingProgress, setReadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef();
    const autoSaveTimerRef = useRef();

    const sections = [
        { id: 'overview', title: 'Overview', icon: Book, color: 'from-blue-500 to-indigo-600' },
        { id: 'childhood', title: 'Childhood', icon: Heart, color: 'from-pink-500 to-rose-600' },
        { id: 'family', title: 'Family', icon: Heart, color: 'from-green-500 to-emerald-600' },
        { id: 'career', title: 'Career', icon: Book, color: 'from-purple-500 to-violet-600' },
        { id: 'achievements', title: 'Achievements', icon: Book, color: 'from-yellow-500 to-amber-600' },
        { id: 'wisdom', title: 'Wisdom', icon: Lightbulb, color: 'from-orange-500 to-red-600' }
    ];

    // Auto-save functionality
    useEffect(() => {
        const handleScroll = () => {
            if (showBookView) {
                const scrollTop = window.pageYOffset;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                setReadingProgress(Math.min(scrollPercent, 100));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showBookView]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value }));
        triggerAutoSave();
    };

    const triggerAutoSave = () => {
        setAutoSaveStatus('saving');
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
            localStorage.setItem('biographyData', JSON.stringify(formData));
            localStorage.setItem('biographyPhotos', JSON.stringify(photos));
            localStorage.setItem('biographyRecordings', JSON.stringify(recordings));
            setAutoSaveStatus('saved');
        }, 1000);
    };

    const loadSavedData = () => {
        const savedData = localStorage.getItem('biographyData');
        const savedPhotos = localStorage.getItem('biographyPhotos');
        const savedRecordings = localStorage.getItem('biographyRecordings');

        if (savedData) setFormData(JSON.parse(savedData));
        if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
        if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
    };

    const addMemory = () => {
        const newMemory = {
            id: Date.now(),
            title: `Special Memory ${formData.memories.length + 1}`,
            content: ''
        };
        setFormData(prev => ({
            ...prev,
            memories: [...prev.memories, newMemory]
        }));
        setCurrentSection(`memory-${newMemory.id}`);
        triggerAutoSave();
    };

    const updateMemory = (id, content) => {
        setFormData(prev => ({
            ...prev,
            memories: prev.memories.map(m => m.id === id ? {...m, content } : m)
        }));
        triggerAutoSave();
    };

    const addTimelineEvent = () => {
        const newEvent = {
            year: new Date().getFullYear(),
            event: 'New Event',
            category: 'family'
        };
        setFormData(prev => ({
            ...prev,
            timeline: [...prev.timeline, newEvent]
        }));
        triggerAutoSave();
    };

    const handlePhotoUpload = (sectionId) => {
        fileInputRef.current.click();
        fileInputRef.current.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newPhoto = {
                        id: Date.now(),
                        name: file.name,
                        url: e.target.result,
                        caption: ''
                    };
                    setPhotos(prev => ({
                        ...prev,
                        [sectionId]: [...(prev[sectionId] || []), newPhoto]
                    }));
                    triggerAutoSave();
                };
                reader.readAsDataURL(file);
            }
        };
    };

    const updatePhotoCaption = (sectionId, photoId, caption) => {
        setPhotos(prev => ({
            ...prev,
            [sectionId]: prev[sectionId].map(photo =>
                photo.id === photoId ? {...photo, caption } : photo
            )
        }));
        triggerAutoSave();
    };

    const startRecording = async(sectionId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordings(prev => ({...prev, [sectionId]: url }));
                triggerAutoSave();
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(sectionId);
            setRecordingTime(0);

            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            recorder.onstop = () => {
                clearInterval(timer);
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordings(prev => ({...prev, [sectionId]: url }));
                triggerAutoSave();
            };
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(null);
        setRecordingTime(0);
    };

    const playRecording = (sectionId) => {
        const audio = new Audio(recordings[sectionId]);
        audio.play();
    };

    const exportBiography = (format) => {
        setIsLoading(true);
        setTimeout(() => {
            let content = `Biography of ${formData.name}\n\n`;

            sections.forEach(section => {
                if (formData[section.id]) {
                    content += `${section.title}\n${'='.repeat(section.title.length)}\n${formData[section.id]}\n\n`;
                }
            });

            if (formData.memories.length > 0) {
                content += `Special Memories\n${'='.repeat(15)}\n`;
                formData.memories.forEach(memory => {
                    content += `${memory.title}\n${memory.content}\n\n`;
                });
            }

            switch (format) {
                case 'PDF':
                    alert('PDF export would be implemented here');
                    break;
                case 'Word':
                    alert('Word export would be implemented here');
                    break;
                case 'Web':
                    alert('Web export would be implemented here');
                    break;
                case 'Email':
                    alert('Email export would be implemented here');
                    break;
                default:
                    break;
            }
            setIsLoading(false);
        }, 2000);
    };

    const printBook = () => {
        window.print();
    };

    const shareBiography = () => {
        if (navigator.share) {
            navigator.share({
                title: `Biography of ${formData.name}`,
                text: 'Check out this life story!',
                url: window.location.href
            });
        } else {
            alert('Sharing not supported on this browser');
        }
    };

    const getSectionPlaceholder = (section) => {
        const placeholders = {
            overview: "Tell us about yourself. What makes you unique? What are your core values and beliefs?",
            childhood: "Share your earliest memories. What was your childhood like? What games did you play?",
            family: "Describe your family relationships. What traditions did you have?",
            career: "Walk us through your professional journey. What jobs did you have?",
            achievements: "What are you most proud of? What challenges did you overcome?",
            wisdom: "What life lessons would you pass on to future generations?"
        };
        return placeholders[section] || "Share your thoughts and experiences...";
    };

    const getSectionTip = (section) => {
        const tips = {
            overview: "Start with the basics and paint a picture of who you are. This will help your family understand your personality and character.",
            childhood: "Include sensory details - what did things smell, sound, or look like? These details bring memories to life.",
            family: "Share both the joyful moments and the challenges. Real stories help your family understand your journey.",
            career: "Don't just list jobs - explain what you learned and how work shaped who you became.",
            achievements: "Include both big and small victories. Sometimes the small ones mean the most.",
            wisdom: "Think about lessons you learned the hard way, or insights that came with age and experience."
        };
        return tips[section] || "Take your time and write from the heart. Your family will treasure these words.";
    };

    const currentSectionData = sections.find(s => s.id === currentSection);
    const currentSectionId = currentSection.startsWith('memory-') ? currentSection : currentSection;

    const filteredSections = sections.filter(section => {
        if (!searchTerm) return true;
        const content = formData[section.id] || '';
        return section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            content.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredMemories = formData.memories.filter(memory => {
        if (!searchTerm) return true;
        return memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (memory.content && memory.content.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    if (showWelcome) {
        return ( <
            div className = "min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center" >
            <
            div className = "text-center space-y-8 animate-fade-in" >
            <
            div className = "relative" >
            <
            Book className = "h-24 w-24 text-amber-600 mx-auto mb-6 animate-bounce" / >
            <
            Sparkles className = "h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" / >
            <
            /div> <
            div >
            <
            h1 className = "text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4" >
            Life Stories <
            /h1> <
            p className = "text-2xl text-gray-600 mb-8" > Preserving memories
            for generations < /p> <
            div className = "flex items-center justify-center space-x-2 text-amber-600" >
            <
            div className = "w-2 h-2 bg-amber-600 rounded-full animate-bounce" > < /div> <
            div className = "w-2 h-2 bg-amber-600 rounded-full animate-bounce"
            style = {
                { animationDelay: '0.1s' }
            } > < /div> <
            div className = "w-2 h-2 bg-amber-600 rounded-full animate-bounce"
            style = {
                { animationDelay: '0.2s' }
            } > < /div> < /
            div > <
            /div> < /
            div > <
            /div>
        );
    }

    if (showTimeline) {
        return ( <
            div className = "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100" >
            <
            div className = "bg-white shadow-sm border-b-4 border-amber-200" >
            <
            div className = "max-w-6xl mx-auto px-6 py-6" >
            <
            div className = "flex items-center justify-between" >
            <
            div className = "flex items-center space-x-4" >
            <
            Calendar className = "h-10 w-10 text-amber-600" / >
            <
            div >
            <
            h1 className = "text-3xl font-bold text-gray-800" > Life Timeline < /h1> <
            p className = "text-lg text-gray-600" > Your journey through the years < /p> < /
            div > <
            /div> <
            div className = "flex space-x-4" >
            <
            button onClick = { addTimelineEvent }
            className = "bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2" >
            <
            Plus className = "h-5 w-5" / >
            <
            span > Add Event < /span> < /
            button > <
            button onClick = {
                () => setShowTimeline(false)
            }
            className = "bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors" >
            Back to Story <
            /button> < /
            div > <
            /div> < /
            div > <
            /div>

            <
            div className = "max-w-4xl mx-auto px-6 py-8" >
            <
            div className = "bg-white rounded-xl shadow-lg p-8" >
            <
            div className = "space-y-8" > {
                formData.timeline.map((event, index) => ( <
                    div key = { index }
                    className = "flex items-start space-x-6" >
                    <
                    div className = "flex-shrink-0" >
                    <
                    div className = { `w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                            event.category === 'family' ? 'bg-pink-500' :
                                            event.category === 'career' ? 'bg-blue-500' :
                                            event.category === 'education' ? 'bg-green-500' :
                                            'bg-purple-500'
                                        }` } > { event.year } <
                    /div> < /
                    div > <
                    div className = "flex-1 bg-gray-50 rounded-lg p-6" >
                    <
                    h3 className = "text-xl font-bold text-gray-800 mb-2" > { event.event } < /h3> <
                    p className = "text-gray-600 capitalize" > { event.category } < /p> < /
                    div > <
                    /div>
                ))
            } <
            /div> < /
            div > <
            /div> < /
            div >
        );
    }

    if (showBookView) {
        return ( <
            div className = "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100" >
            <
            div className = "bg-white shadow-sm border-b-4 border-amber-200" >
            <
            div className = "max-w-6xl mx-auto px-6 py-6" >
            <
            div className = "flex items-center justify-between" >
            <
            div className = "flex items-center space-x-4" >
            <
            Book className = "h-10 w-10 text-amber-600" / >
            <
            div >
            <
            h1 className = "text-3xl font-bold text-gray-800" > Book View < /h1> <
            p className = "text-lg text-gray-600" > Read your life story as a book < /p> < /
            div > <
            /div> <
            div className = "flex space-x-4" >
            <
            button onClick = { printBook }
            className = "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2" >
            <
            FileText className = "h-4 w-4" / >
            <
            span > Print < /span> < /
            button > <
            button onClick = { shareBiography }
            className = "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2" >
            <
            Download className = "h-4 w-4" / >
            <
            span > Share < /span> < /
            button > <
            button onClick = {
                () => setShowBookView(false)
            }
            className = "bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors" >
            Back to Editor <
            /button> < /
            div > <
            /div> < /
            div > <
            /div>

            <
            div className = "max-w-4xl mx-auto px-6 py-8" >
            <
            div className = "bg-white rounded-xl shadow-2xl p-8 book-container" > { /* Book Cover */ } <
            div className = "text-center mb-12 pb-8 border-b-4 border-amber-200" >
            <
            h1 className = "text-4xl font-serif font-bold text-amber-800 mb-4" >
            The Life Story of { formData.name } <
            /h1> <
            p className = "text-xl text-gray-600 italic" >
            A legacy preserved
            for family and future generations <
            /p> < /
            div >

            { /* Table of Contents */ } <
            div className = "mb-12 pb-8 border-b-2 border-gray-200" >
            <
            h2 className = "text-2xl font-serif font-bold text-gray-800 mb-6" > Table of Contents < /h2> <
            div className = "space-y-2" > {
                sections.map((section, index) => ( <
                    div key = { section.id }
                    className = "flex justify-between items-center py-2" >
                    <
                    span className = "text-lg text-gray-700" > { index + 1 }. { section.title } < /span> <
                    span className = "text-gray-500" > ... < /span> < /
                    div >
                ))
            } {
                formData.memories.length > 0 && ( <
                    div className = "flex justify-between items-center py-2" >
                    <
                    span className = "text-lg text-gray-700" > { sections.length + 1 }.Special Memories < /span> <
                    span className = "text-gray-500" > ... < /span> < /
                    div >
                )
            } <
            /div> < /
            div >

            { /* Chapters */ } {
                sections.map((section) => ( <
                        div key = { section.id }
                        className = "mb-12" >
                        <
                        h2 className = "text-3xl font-serif font-bold text-gray-800 mb-6" > { section.title } < /h2> {
                        formData[section.id] ? ( <
                            div className = "prose prose-lg max-w-none" >
                            <
                            p className = "text-lg leading-relaxed text-gray-700 whitespace-pre-wrap" > { formData[section.id] } < /p> < /
                            div >
                        ) : ( <
                            p className = "text-gray-500 italic" > This chapter is waiting to be written... < /p>
                        )
                    } <
                    /div>
                ))
        }

        { /* Special Memories Chapter */ } {
            formData.memories.length > 0 && ( <
                div className = "mb-12" >
                <
                h2 className = "text-3xl font-serif font-bold text-gray-800 mb-6" > Special Memories < /h2> <
                div className = "space-y-8" > {
                    formData.memories.map((memory) => ( <
                        div key = { memory.id }
                        className = "border-l-4 border-pink-300 pl-6" >
                        <
                        h3 className = "text-xl font-serif font-semibold text-pink-800 mb-3" > { memory.title } < /h3> <
                        p className = "text-lg leading-relaxed text-gray-700 whitespace-pre-wrap" > { memory.content } < /p> < /
                        div >
                    ))
                } <
                /div> < /
                div >
            )
        }

        { /* Book End */ } <
        div className = "text-center mt-16 pt-8 border-t-4 border-amber-200" >
            <
            p className = "text-xl text-gray-600 italic mb-4" >
            "The stories we tell become the legacy we leave." <
            /p> <
        p className = "text-gray-500" >
            This biography was lovingly created to preserve precious memories < br / >
            and share wisdom with future generations. <
            /p> < /
            div > <
            /div> < /
            div > <
            /div>
    );
}

// Main Editor View
return ( <
        div className = { `min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'} transition-colors duration-300` } >
        <
        input type = "file"
        ref = { fileInputRef }
        style = {
            { display: 'none' }
        }
        accept = "image/*" /
        >

        { /* Reading Progress Bar */ } {
            showBookView && ( <
                div className = "fixed top-0 left-0 w-full h-1 bg-gray-200 z-50" >
                <
                div className = "h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style = {
                    { width: `${readingProgress}%` }
                } >
                <
                /div> < /
                div >
            )
        }

        { /* Header */ } <
        div className = { `${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} shadow-lg border-b-4 border-amber-200 transition-colors duration-300` } >
        <
        div className = "max-w-6xl mx-auto px-6 py-6" >
        <
        div className = "flex items-center justify-between" >
        <
        div className = "flex items-center space-x-4" >
        <
        div className = { `p-3 ${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'} rounded-xl shadow-lg` } >
        <
        Book className = "h-10 w-10 text-white" / >
        <
        /div> <
        div >
        <
        h1 className = { `text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}` } > Life Stories < /h1> <
        p className = { `text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}` } > Preserving memories
        for generations < /p> < /
        div > <
        /div>

        <
        div className = "text-right" >
        <
        p className = { `text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}` } > Biography of { formData.name } < /p>

        { /* Auto-save status */ } <
        div className = "flex items-center space-x-2 mt-1" >
        <
        div className = { `w-2 h-2 rounded-full ${
                                    autoSaveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' : 
                                    autoSaveStatus === 'saved' ? 'bg-green-500' : 'bg-red-500'
                                }` } > < /div> <
        span className = { `text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}` } > { autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'All changes saved' : 'Save failed' } <
        /span> < /
        div >

        <
        div className = "flex space-x-4 mt-2" > { /* Search */ } <
        div className = "relative" >
        <
        input type = "text"
        placeholder = "Search your story..."
        value = { searchTerm }
        onChange = {
            (e) => setSearchTerm(e.target.value)
        }
        className = { `px-4 py-2 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors ${
                                            darkMode 
                                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                                                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                        }` }
        /> <
        Search className = { `h-4 w-4 absolute right-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}` }
        /> < /
        div >

        { /* Dark mode toggle */ } <
        button onClick = {
            () => setDarkMode(!darkMode)
        }
        className = { `p-2 rounded-lg transition-colors ${
                                        darkMode 
                                            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }` } > { darkMode ? < Sun className = "h-5 w-5" / > : < Moon className = "h-5 w-5" / > } <
        /button>

        <
        button onClick = {
            () => setShowTimeline(true)
        }
        className = "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2" >
        <
        Calendar className = "h-4 w-4" / >
        <
        span > Timeline < /span> < /
        button >

        <
        button onClick = {
            () => setShowBookView(!showBookView)
        }
        className = "bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2" >
        <
        Book className = "h-4 w-4" / >
        <
        span > { showBookView ? 'Edit Mode' : 'Book View' } < /span> < /
        button >

        <
        div className = "relative" >
        <
        select onChange = {
            (e) => exportBiography(e.target.value)
        }
        className = "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors appearance-none cursor-pointer"
        defaultValue = "" >
        <
        option value = ""
        disabled > Export As... < /option> <
        option value = "PDF" > 📄PDF Document < /option> <
        option value = "Word" > 📝Word Document < /option> <
        option value = "Web" > 🌐Web Page < /option> <
        option value = "Email" > 📧Email Format < /option> < /
        select > <
        Download className = "h-4 w-4 absolute right-2 top-3 text-white pointer-events-none" / >
        <
        /div>

        <
        button className = "bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 text-lg" >
        <
        Save className = "h-5 w-5" / >
        <
        span > Save < /span> < /
        button > <
        /div> < /
        div > <
        /div> < /
        div > <
        /div>

        { /* Main Content */ } <
        div className = "max-w-6xl mx-auto px-6 py-8" >
        <
        div className = "grid grid-cols-1 lg:grid-cols-4 gap-8" > { /* Sidebar */ } <
        div className = "lg:col-span-1" >
        <
        div className = { `${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-8` } >
        <
        h2 className = { `text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}` } > Sections < /h2>

        { /* Search Results Summary */ } {
            searchTerm && ( <
                div className = "mb-4 p-3 bg-amber-100 rounded-lg" >
                <
                p className = "text-sm text-amber-800" >
                Found { filteredSections.length }
                sections and { filteredMemories.length }
                memories matching "{searchTerm}" <
                /p> < /
                div >
            )
        }

        <
        div className = "space-y-2" > {
            filteredSections.map((section) => ( <
                    button key = { section.id }
                    onClick = {
                        () => setCurrentSection(section.id)
                    }
                    className = { `w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                                            currentSection === section.id
                                                ? `${darkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`
                                                : `${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`
                                        }`}
                                    >
                                        {React.createElement(section.icon, { className: "h-4 w-4" })}
                                        <span className="font-medium">{section.title}</span>
                                    </button>
                                ))}

                                {/* Special Memories Section */}
                                <div className="mt-6">
                                    <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Special Memories</h3>
                                    <div className="space-y-2">
                                        {filteredMemories.map((memory) => (
                                            <button
                                                key={memory.id}
                                                onClick={() => setCurrentSection(`memory-${memory.id}`)}
                                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                                                    currentSection === `memory-${memory.id}`
                                                        ? `${darkMode ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800'}`
                                                        : `${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`
                                                }`}
                                            >
                                                <Heart className="h-4 w-4" />
                                                <span className="font-medium truncate">{memory.title}</span>
                                            </button>
                                        ))}
                                        <button
                                            onClick={addMemory}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                                                darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span className="font-medium">Add Memory</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {currentSection.startsWith('memory-') ? (
                                (() => {
                                    const memoryId = parseInt(currentSection.split('-')[1]);
                                    const memory = formData.memories.find(m => m.id === memoryId);
                                    const sectionPhotos = photos[currentSection] || [];
                                    return (
                                        <div className="animate-fade-in">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
                                                        <Heart className="h-8 w-8 text-white" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-gray-800">{memory && memory.title}</h2>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <button onClick={() => handlePhotoUpload(currentSection)} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                        <Camera className="h-4 w-4" />
                                                        <span>Add Photo</span>
                                                    </button>
                                                    {isRecording === currentSection ? (
                                                        <button onClick={stopRecording} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 animate-pulse">
                                                            <MicOff className="h-4 w-4" />
                                                            <span>Stop({formatTime(recordingTime)})</span>
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => startRecording(currentSection)} className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                            <Mic className="h-4 w-4" />
                                                            <span>Record Voice</span>
                                                        </button>
                                                    )}
                                                    {recordings[currentSection] && (
                                                        <button onClick={() => playRecording(currentSection)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                            <Play className="h-4 w-4" />
                                                            <span>Play</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Photos for this memory */}
                                            {sectionPhotos.length > 0 && (
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                                        <Image className="h-5 w-5 text-blue-500" />
                                                        <span>Photos</span>
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {sectionPhotos.map((photo) => (
                                                            <div key={photo.id} className="space-y-3 group">
                                                                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                                                                    <img src={photo.url} alt={photo.caption || photo.name} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add a caption for this photo..."
                                                                    value={photo.caption}
                                                                    onChange={(e) => updatePhotoCaption(currentSection, photo.id, e.target.value)}
                                                                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-pink-400 focus:outline-none transition-colors"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <textarea
                                                value={memory && memory.content || ''}
                                                onChange={(e) => updateMemory(memoryId, e.target.value)}
                                                placeholder="Share this special memory in detail. What happened? Who was there? How did it make you feel? Why is it important to you?"
                                                className="w-full h-96 p-6 border-2 border-gray-200 rounded-xl text-lg leading-relaxed resize-none focus:border-pink-400 focus:outline-none transition-colors shadow-inner"
                                            />

                                            <p className="text-gray-500 mt-4 text-lg flex items-center space-x-2">
                                                <Clock className="h-5 w-5" />
                                                <span>Take your time to capture every detail of this precious memory.</span>
                                            </p>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-xl shadow-lg bg-gradient-to-r ${currentSectionData.color}`}>{React.createElement(currentSectionData.icon, { className: "h-8 w-8 text-white" })}</div>
                                            <h2 className="text-3xl font-bold text-gray-800">{currentSectionData.title}</h2>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button onClick={() => handlePhotoUpload(currentSection)} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                <Camera className="h-4 w-4" />
                                                <span>Add Photo</span>
                                            </button>
                                            {isRecording === currentSection ? (
                                                <button onClick={stopRecording} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 animate-pulse">
                                                    <MicOff className="h-4 w-4" />
                                                    <span>Stop({formatTime(recordingTime)})</span>
                                                </button>
                                            ) : (
                                                <button onClick={() => startRecording(currentSection)} className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                    <Mic className="h-4 w-4" />
                                                    <span>Record Voice</span>
                                                </button>
                                            )}
                                            {recordings[currentSection] && (
                                                <button onClick={() => playRecording(currentSection)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                                    <Play className="h-4 w-4" />
                                                    <span>Play</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photos for this section */}
                                    {photos[currentSection] && photos[currentSection].length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                                <Image className="h-5 w-5 text-blue-500" />
                                                <span>Photos</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                {photos[currentSection].map((photo) => (
                                                    <div key={photo.id} className="space-y-3 group">
                                                        <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                                                            <img src={photo.url} alt={photo.caption || photo.name} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Add a caption for this photo..."
                                                            value={photo.caption}
                                                            onChange={(e) => updatePhotoCaption(currentSection, photo.id, e.target.value)}
                                                            className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-amber-400 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        value={formData[currentSection]}
                                        onChange={(e) => handleInputChange(currentSection, e.target.value)}
                                        placeholder={getSectionPlaceholder(currentSection)}
                                        className="w-full h-96 p-6 border-2 border-gray-200 rounded-xl text-lg leading-relaxed resize-none focus:border-amber-400 focus:outline-none transition-colors shadow-inner"
                                    />

                                    <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-l-4 border-amber-400">
                                        <p className="text-amber-800 text-lg flex items-start space-x-3">
                                            <Lightbulb className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                                            <span><strong>Tip:</strong> {getSectionTip(currentSection)}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                            <span className="text-lg font-semibold text-gray-700">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiographyApp;