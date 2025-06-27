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
    Sparkles,
    User,
    LogOut,
    Settings,
    Target
} from 'lucide-react';
import { auth, onAuthChange, saveUserData, getUserData, updateUserData } from './firebase';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import WritingPrompts from './components/WritingPrompts';

const BiographyApp = () => {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [showAdminPanel, setShowAdminPanel] = useState(false);
        const [showWritingPrompts, setShowWritingPrompts] = useState(false);
        const [writingStreak, setWritingStreak] = useState(0);
        const [lastWriteDate, setLastWriteDate] = useState(null);
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
        const [pin, setPin] = useState('');
        const [enteredPin, setEnteredPin] = useState('');
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [showPinSetup, setShowPinSetup] = useState(false);
        const [showPinChange, setShowPinChange] = useState(false);
        const [newPin, setNewPin] = useState('');
        const [pinError, setPinError] = useState('');

        const sections = [
            { id: 'overview', title: 'Overview', icon: Book, color: 'from-blue-500 to-indigo-600' },
            { id: 'childhood', title: 'Childhood', icon: Heart, color: 'from-pink-500 to-rose-600' },
            { id: 'family', title: 'Family', icon: Heart, color: 'from-green-500 to-emerald-600' },
            { id: 'career', title: 'Career', icon: Book, color: 'from-purple-500 to-violet-600' },
            { id: 'achievements', title: 'Achievements', icon: Book, color: 'from-yellow-500 to-amber-600' },
            { id: 'wisdom', title: 'Wisdom', icon: Lightbulb, color: 'from-orange-500 to-red-600' }
        ];

        // Authentication state management
        useEffect(() => {
            const unsubscribe = onAuthChange((user) => {
                setUser(user);
                setLoading(false);
                if (user) {
                    loadUserData(user.uid);
                }
            });

            return () => unsubscribe();
        }, []);

        // Load user-specific data
        const loadUserData = async(userId) => {
            try {
                console.log('Loading data for user:', userId);
                const userData = await getUserData(userId);
                if (userData) {
                    console.log('User data loaded successfully:', {
                        formDataKeys: Object.keys(userData.formData || {}),
                        photosCount: Object.keys(userData.photos || {}).length,
                        recordingsCount: Object.keys(userData.recordings || {}).length,
                        writingStreak: userData.writingStreak,
                        lastWriteDate: userData.lastWriteDate
                    });

                    setFormData(userData.formData || {
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
                    setPhotos(userData.photos || {});
                    setRecordings(userData.recordings || {});
                    setWritingStreak(userData.writingStreak || 0);
                    setLastWriteDate(userData.lastWriteDate || null);
                } else {
                    console.log('No existing data found for user:', userId);
                    // Initialize with empty data
                    setFormData({
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
                    setPhotos({});
                    setRecordings({});
                    setWritingStreak(0);
                    setLastWriteDate(null);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        // Manual save function for testing
        const manualSave = async() => {
            if (!user) {
                console.error('No user logged in');
                return;
            }

            console.log('Manual save triggered');
            setAutoSaveStatus('saving');

            try {
                const success = await saveUserData(user.uid, {
                    formData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });

                if (success) {
                    setAutoSaveStatus('saved');
                    console.log('Manual save successful');
                } else {
                    setAutoSaveStatus('error');
                    console.error('Manual save failed');
                }
            } catch (error) {
                console.error('Manual save error:', error);
                setAutoSaveStatus('error');
            }
        };

        // Update writing streak
        const updateWritingStreak = () => {
            const today = new Date().toDateString();
            if (lastWriteDate !== today) {
                const newStreak = lastWriteDate ? writingStreak + 1 : 1;
                setWritingStreak(newStreak);
                setLastWriteDate(today);

                if (user) {
                    saveUserData(user.uid, {
                        writingStreak: newStreak,
                        lastWriteDate: today,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        };

        // Handle writing prompt selection
        const handlePromptSelect = (prompt) => {
            setShowWritingPrompts(false);
            // Add the prompt to the current section
            const currentContent = formData[currentSection] || '';
            const newContent = currentContent + (currentContent ? '\n\n' : '') + `Prompt: ${prompt}\n\n`;
            handleInputChange(currentSection, newContent);
            updateWritingStreak();
        };

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

        // Load PIN from localStorage on mount
        useEffect(() => {
            const savedPin = localStorage.getItem('biographyPin');
            if (savedPin) {
                setPin(savedPin);
                setShowPinSetup(false);
            } else {
                setShowPinSetup(true);
            }
        }, []);

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const triggerAutoSave = (updatedData = null) => {
            if (!user) return;

            setAutoSaveStatus('saving');
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(async() => {
                try {
                    // Use the updated data if provided, otherwise use current state
                    const dataToSave = updatedData || {
                        formData,
                        photos,
                        recordings,
                        writingStreak,
                        lastWriteDate,
                        updatedAt: new Date().toISOString()
                    };

                    console.log('Saving user data:', {
                        userId: user.uid,
                        dataKeys: Object.keys(dataToSave),
                        formDataKeys: Object.keys(dataToSave.formData || {}),
                        hasPhotos: Object.keys(dataToSave.photos || {}).length,
                        hasRecordings: Object.keys(dataToSave.recordings || {}).length
                    });

                    const success = await saveUserData(user.uid, dataToSave);

                    if (success) {
                        setAutoSaveStatus('saved');
                        console.log('Data saved successfully');
                    } else {
                        setAutoSaveStatus('error');
                        console.error('Failed to save data');
                    }
                } catch (error) {
                    console.error('Auto-save error:', error);
                    setAutoSaveStatus('error');
                }
            }, 1000);
        };

        const handleInputChange = (field, value) => {
            setFormData(prev => {
                const newFormData = {...prev, [field]: value };
                // Pass the updated data to triggerAutoSave
                triggerAutoSave({
                    formData: newFormData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });
                return newFormData;
            });
            updateWritingStreak();
        };

        const addMemory = () => {
            const newMemory = {
                id: Date.now(),
                title: `Special Memory ${formData.memories.length + 1}`,
                content: ''
            };
            setFormData(prev => {
                const newFormData = {
                    ...prev,
                    memories: [...prev.memories, newMemory]
                };
                triggerAutoSave({
                    formData: newFormData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });
                return newFormData;
            });
            setCurrentSection(`memory-${newMemory.id}`);
            updateWritingStreak();
        };

        const updateMemory = (id, content) => {
            setFormData(prev => {
                const newFormData = {
                    ...prev,
                    memories: prev.memories.map(m => m.id === id ? {...m, content } : m)
                };
                triggerAutoSave({
                    formData: newFormData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });
                return newFormData;
            });
            updateWritingStreak();
        };

        const addTimelineEvent = () => {
            const newEvent = {
                year: new Date().getFullYear(),
                event: 'New Event',
                category: 'family'
            };
            setFormData(prev => {
                const newFormData = {
                    ...prev,
                    timeline: [...prev.timeline, newEvent]
                };
                triggerAutoSave({
                    formData: newFormData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });
                return newFormData;
            });
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
                        setPhotos(prev => {
                            const newPhotos = {
                                ...prev,
                                [sectionId]: [...(prev[sectionId] || []), newPhoto]
                            };
                            triggerAutoSave({
                                formData,
                                photos: newPhotos,
                                recordings,
                                writingStreak,
                                lastWriteDate,
                                updatedAt: new Date().toISOString()
                            });
                            return newPhotos;
                        });
                    };
                    reader.readAsDataURL(file);
                }
            };
        };

        const updatePhotoCaption = (sectionId, photoId, caption) => {
            setPhotos(prev => {
                const newPhotos = {
                    ...prev,
                    [sectionId]: prev[sectionId].map(photo =>
                        photo.id === photoId ? {...photo, caption } : photo
                    )
                };
                triggerAutoSave({
                    formData,
                    photos: newPhotos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });
                return newPhotos;
            });
        };

        const startRecording = async(sectionId) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                const chunks = [];

                recorder.ondataavailable = (e) => chunks.push(e.data);

                const saveRecording = (blob) => {
                    const url = URL.createObjectURL(blob);
                    setRecordings(prev => {
                        const newRecordings = {
                            ...prev,
                            [sectionId]: url
                        };
                        triggerAutoSave({
                            formData,
                            photos,
                            recordings: newRecordings,
                            writingStreak,
                            lastWriteDate,
                            updatedAt: new Date().toISOString()
                        });
                        return newRecordings;
                    });
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    saveRecording(blob);
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
                    saveRecording(blob);
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
                let content = '';
                let filename = '';

                switch (format) {
                    case 'pdf':
                        content = `Name: ${formData.name}\n\nOverview: ${formData.overview}\n\nChildhood: ${formData.childhood}\n\nFamily: ${formData.family}\n\nCareer: ${formData.career}\n\nAchievements: ${formData.achievements}\n\nWisdom: ${formData.wisdom}`;
                        filename = 'biography.pdf';
                        break;
                    case 'word':
                        content = `Name: ${formData.name}\n\nOverview: ${formData.overview}\n\nChildhood: ${formData.childhood}\n\nFamily: ${formData.family}\n\nCareer: ${formData.career}\n\nAchievements: ${formData.achievements}\n\nWisdom: ${formData.wisdom}`;
                        filename = 'biography.docx';
                        break;
                    case 'web':
                        content = `<!DOCTYPE html><html><head><title>${formData.name}'s Biography</title></head><body><h1>${formData.name}</h1><p>${formData.overview}</p></body></html>`;
                        filename = 'biography.html';
                        break;
                    case 'email':
                        content = `Subject: ${formData.name}'s Biography\n\nName: ${formData.name}\nOverview: ${formData.overview}\nChildhood: ${formData.childhood}\nFamily: ${formData.family}\nCareer: ${formData.career}\nAchievements: ${formData.achievements}\nWisdom: ${formData.wisdom}`;
                        filename = 'biography_email.txt';
                        break;
                    default:
                        break;
                }

                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                setIsLoading(false);
            }, 1000);
        };

        const printBook = () => {
            window.print();
        };

        const shareBiography = () => {
            if (navigator.share) {
                navigator.share({
                    title: `${formData.name}'s Biography`,
                    text: formData.overview,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        };

        const getSectionPlaceholder = (section) => {
            const placeholders = {
                overview: "Tell us about yourself...",
                childhood: "Share your childhood memories...",
                family: "Describe your family...",
                career: "Write about your career journey...",
                achievements: "List your accomplishments...",
                wisdom: "Share your life lessons..."
            };
            return placeholders[section] || "Start writing...";
        };

        const getSectionTip = (section) => {
            const tips = {
                overview: "Include your name, age, and a brief introduction",
                childhood: "Mention your birthplace, family, and early memories",
                family: "Describe your parents, siblings, and family traditions",
                career: "Share your education, jobs, and professional growth",
                achievements: "List awards, milestones, and proud moments",
                wisdom: "Share advice, lessons learned, and life philosophy"
            };
            return tips[section] || "Write from your heart";
        };

        // Loading state
        if (loading) {
            return ( <
                div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" >
                <
                div className = "text-center" >
                <
                div className = "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" > < /div> <
                p className = "text-gray-600" > Loading... < /p> < /
                div > <
                /div>
            );
        }

        // Authentication required
        if (!user) {
            return ( <
                Auth onAuthSuccess = {
                    () => {}
                }
                isAdmin = { false }
                onAdminPanel = {
                    () => setShowAdminPanel(true)
                }
                />
            );
        }

        // Admin panel
        if (showAdminPanel) {
            return <AdminPanel onBack = {
                () => setShowAdminPanel(false)
            }
            />;
        }

        // Writing prompts view
        if (showWritingPrompts) {
            return ( <
                div className = "min-h-screen bg-gradient-to-br from-purple-50 to-pink-100" >
                <
                div className = "max-w-4xl mx-auto px-6 py-8" >
                <
                div className = "flex items-center justify-between mb-8" >
                <
                h1 className = "text-3xl font-bold text-gray-800" > Writing Prompts < /h1> <
                button onClick = {
                    () => setShowWritingPrompts(false)
                }
                className = "bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors" >
                Back to Editor <
                /button> < /
                div > <
                WritingPrompts onPromptSelect = { handlePromptSelect }
                currentSection = { currentSection }
                /> < /
                div > <
                /div>
            );
        }

        // Welcome screen
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

        // Timeline view
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

        // Book view
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
                div className = "bg-white rounded-xl shadow-lg p-8 book-content" >
                <
                div className = "text-center mb-12" >
                <
                h1 className = "text-4xl font-bold text-gray-900 mb-4" > { formData.name || 'My Life Story' } < /h1> <
                p className = "text-xl text-gray-600" > A Journey Through Time < /p> < /
                div >

                <
                div className = "space-y-12" > {
                    sections.map((section) => ( <
                        div key = { section.id }
                        className = "chapter" >
                        <
                        h2 className = "text-3xl font-bold text-gray-800 mb-6 border-b-2 border-amber-200 pb-2" >
                        Chapter { sections.indexOf(section) + 1 }: { section.title } <
                        /h2> <
                        div className = "prose max-w-none" >
                        <
                        p className = "text-lg leading-relaxed text-gray-700 mb-6" > { formData[section.id] || getSectionPlaceholder(section.id) } <
                        /p>

                        {
                            photos[section.id] && photos[section.id].length > 0 && ( <
                                div className = "my-8" >
                                <
                                h3 className = "text-xl font-semibold text-gray-800 mb-4" > Photos < /h3> <
                                div className = "grid grid-cols-1 md:grid-cols-2 gap-4" > {
                                    photos[section.id].map((photo) => ( <
                                        div key = { photo.id }
                                        className = "text-center" >
                                        <
                                        img src = { photo.url }
                                        alt = { photo.name }
                                        className = "w-full h-48 object-cover rounded-lg shadow-md" /
                                        >
                                        {
                                            photo.caption && ( <
                                                p className = "text-sm text-gray-600 mt-2 italic" > { photo.caption } <
                                                /p>
                                            )
                                        } <
                                        /div>
                                    ))
                                } <
                                /div> < /
                                div >
                            )
                        }

                        {
                            recordings[section.id] && ( <
                                div className = "my-8" >
                                <
                                h3 className = "text-xl font-semibold text-gray-800 mb-4" > Audio Recording < /h3> <
                                button onClick = {
                                    () => playRecording(section.id)
                                }
                                className = "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2" >
                                <
                                Play className = "h-4 w-4" / >
                                <
                                span > Play Recording < /span> < /
                                button > <
                                /div>
                            )
                        } <
                        /div> < /
                        div >
                    ))
                }

                {
                    formData.memories && formData.memories.length > 0 && ( <
                        div className = "chapter" >
                        <
                        h2 className = "text-3xl font-bold text-gray-800 mb-6 border-b-2 border-amber-200 pb-2" >
                        Special Memories <
                        /h2> <
                        div className = "space-y-6" > {
                            formData.memories.map((memory) => ( <
                                div key = { memory.id }
                                className = "bg-amber-50 rounded-lg p-6" >
                                <
                                h3 className = "text-xl font-semibold text-gray-800 mb-3" > { memory.title } <
                                /h3> <
                                p className = "text-lg leading-relaxed text-gray-700" > { memory.content || 'Share your special memory here...' } <
                                /p> < /
                                div >
                            ))
                        } <
                        /div> < /
                        div >
                    )
                } <
                /div> < /
                div > <
                /div> < /
                div >
            );
        }

        // Main editor view
        return ( <
                div className = { `min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-amber-50 to-orange-100'}` } > { /* Header */ } <
                div className = { `${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b-4 border-amber-200` } >
                <
                div className = "max-w-6xl mx-auto px-6 py-4" >
                <
                div className = "flex items-center justify-between" >
                <
                div className = "flex items-center space-x-4" >
                <
                Book className = "h-8 w-8 text-amber-600" / >
                <
                div >
                <
                h1 className = "text-2xl font-bold text-gray-800" > Life Story Biography < /h1> <
                p className = "text-sm text-gray-600" > Preserve your memories
                for generations < /p> < /
                div > <
                /div>

                <
                div className = "flex items-center space-x-4" > { /* User info */ } <
                div className = "flex items-center space-x-2 text-sm text-gray-600" >
                <
                User className = "h-4 w-4" / >
                <
                span > { user.email } < /span> < /
                div >

                { /* Writing streak */ } <
                div className = "flex items-center space-x-2 text-sm text-green-600" >
                <
                Clock className = "h-4 w-4" / >
                <
                span > { writingStreak }
                day streak < /span> < /
                div >

                { /* Auto-save status */ } <
                div className = "flex items-center space-x-2" > {
                    autoSaveStatus === 'saving' && ( <
                        div className = "flex items-center space-x-1 text-blue-600" >
                        <
                        div className = "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" > < /div> <
                        span className = "text-sm" > Saving... < /span> < /
                        div >
                    )
                } {
                    autoSaveStatus === 'saved' && ( <
                        div className = "flex items-center space-x-1 text-green-600" >
                        <
                        Save className = "h-4 w-4" / >
                        <
                        span className = "text-sm" > Saved < /span> < /
                        div >
                    )
                } <
                /div>

                { /* Action buttons */ } <
                div className = "flex space-x-2" >
                <
                button onClick = { manualSave }
                className = "bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2" >
                <
                Save className = "h-4 w-4" / >
                <
                span > Save Now < /span> < /
                button >

                <
                button onClick = {
                    () => setShowWritingPrompts(true)
                }
                className = "bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2" >
                <
                Target className = "h-4 w-4" / >
                <
                span > Prompts < /span> < /
                button >

                <
                button onClick = {
                    () => setShowTimeline(true)
                }
                className = "bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2" >
                <
                Calendar className = "h-4 w-4" / >
                <
                span > Timeline < /span> < /
                button >

                <
                button onClick = {
                    () => setShowBookView(true)
                }
                className = "bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2" >
                <
                Book className = "h-4 w-4" / >
                <
                span > Book View < /span> < /
                button >

                <
                button onClick = {
                    () => setDarkMode(!darkMode)
                }
                className = { `p-2 rounded-lg transition-colors ${
                                        darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }` } > { darkMode ? < Sun className = "h-4 w-4" / > : < Moon className = "h-4 w-4" / > } <
                /button>

                { /* Admin panel button for admin users */ } {
                    user.email === 'admin@example.com' && ( <
                        button onClick = {
                            () => setShowAdminPanel(true)
                        }
                        className = "bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2" >
                        <
                        Settings className = "h-4 w-4" / >
                        <
                        span > Admin < /span> < /
                        button >
                    )
                }

                <
                button onClick = {
                    () => auth.signOut()
                }
                className = "bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2" >
                <
                LogOut className = "h-4 w-4" / >
                <
                span > Logout < /span> < /
                button > <
                /div> < /
                div > <
                /div> < /
                div > <
                /div>

                { /* Main content */ } <
                div className = "max-w-6xl mx-auto px-6 py-8" >
                <
                div className = "grid grid-cols-1 lg:grid-cols-4 gap-8" > { /* Sidebar */ } <
                div className = "lg:col-span-1" >
                <
                div className = { `${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-8` } >
                <
                h2 className = "text-xl font-bold text-gray-800 mb-6" > Sections < /h2> <
                div className = "space-y-2" > {
                    sections.map((section) => {
                            const Icon = section.icon;
                            return ( <
                                    button key = { section.id }
                                    onClick = {
                                        () => setCurrentSection(section.id)
                                    }
                                    className = { `w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                                                currentSection === section.id
                                                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                                                    : darkMode
                                                        ? 'text-gray-300 hover:bg-gray-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{section.title}</span>
                                        </button>
                                    );
                                })}
                                
                                {formData.memories && formData.memories.map((memory) => (
                                    <button
                                        key={memory.id}
                                        onClick={() => setCurrentSection(`memory-${memory.id}`)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                                            currentSection === `memory-${memory.id}`
                                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                                                : darkMode
                                                    ? 'text-gray-300 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Heart className="h-5 w-5" />
                                        <span className="font-medium">{memory.title}</span>
                                    </button>
                                ))}
                                
                                <button
                                    onClick={addMemory}
                                    className="w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 text-blue-600 hover:bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-300"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="font-medium">Add Memory</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main editor */}
                    <div className="lg:col-span-3">
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
                            {/* Section header */}
                            <div className="mb-8">
                                {sections.find(s => s.id === currentSection) ? (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-3xl font-bold text-gray-800">
                                                {sections.find(s => s.id === currentSection).title}
                                            </h2>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePhotoUpload(currentSection)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    <span>Add Photo</span>
                                                </button>
                                                <button
                                                    onClick={() => isRecording === currentSection ? stopRecording() : startRecording(currentSection)}
                                                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                                                        isRecording === currentSection
                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                >
                                                    {isRecording === currentSection ? (
                                                        <>
                                                            <MicOff className="h-4 w-4" />
                                                            <span>Stop Recording ({formatTime(recordingTime)})</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mic className="h-4 w-4" />
                                                            <span>Start Recording</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic">{getSectionTip(currentSection)}</p>
                                    </>
                                ) : currentSection.startsWith('memory-') ? (
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-3xl font-bold text-gray-800">Special Memory</h2>
                                    </div>
                                ) : null}
                            </div>

                            {/* Content editor */}
                            <div className="space-y-6">
                                {sections.find(s => s.id === currentSection) ? (
                                    <textarea
                                        value={formData[currentSection]}
                                        onChange={(e) => handleInputChange(currentSection, e.target.value)}
                                        placeholder={getSectionPlaceholder(currentSection)}
                                        className={`w-full h-64 p-4 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                                        }`}
                                    />
                                ) : currentSection.startsWith('memory-') ? (
                                    <div className="space-y-4">
                                        {formData.memories.map((memory) => {
                                            if (currentSection === `memory-${memory.id}`) {
                                                return (
                                                    <div key={memory.id} className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={memory.title}
                                                            onChange={(e) => updateMemory(memory.id, memory.content, e.target.value)}
                                                            className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                                                            }`}
                                                            placeholder="Memory title"
                                                        />
                                                        <textarea
                                                            value={memory.content}
                                                            onChange={(e) => updateMemory(memory.id, e.target.value)}
                                                            className={`w-full h-64 p-4 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                                                            }`}
                                                            placeholder="Share your special memory..."
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                ) : null}

                                {/* Photos */}
                                {photos[currentSection] && photos[currentSection].length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Photos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {photos[currentSection].map((photo) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.name}
                                                        className="w-full h-48 object-cover rounded-lg shadow-md"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={photo.caption}
                                                        onChange={(e) => updatePhotoCaption(currentSection, photo.id, e.target.value)}
                                                        className="w-full mt-2 p-2 border border-gray-200 rounded text-sm"
                                                        placeholder="Add caption..."
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recordings */}
                                {recordings[currentSection] && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Audio Recording</h3>
                                        <button
                                            onClick={() => playRecording(currentSection)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Play className="h-4 w-4" />
                                            <span>Play Recording</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Export options */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mt-8`}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Export Options</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['pdf', 'word', 'web', 'email'].map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => exportBiography(format)}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex flex-col items-center space-y-2 disabled:opacity-50"
                                    >
                                        <Download className="h-6 w-6" />
                                        <span className="font-medium capitalize">{format}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default BiographyApp;