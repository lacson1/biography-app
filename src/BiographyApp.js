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
    Target,
    File,
    FileText as FileTextIcon,
    Globe,
    Mail,
    Share2
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
        const [saveHistory, setSaveHistory] = useState([]);
        const [lastSaveTime, setLastSaveTime] = useState(null);
        const [unsavedChanges, setUnsavedChanges] = useState(false);
        const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
        const [recoveryData, setRecoveryData] = useState(null);
        const fileInputRef = useRef();
        const autoSaveTimerRef = useRef();
        const lastSaveRef = useRef();
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

        // Enhanced intelligent writing prompts with context awareness
        const getIntelligentPrompts = (section) => {
            const basePrompts = {
                overview: [
                    "Tell us about yourself in a few sentences...",
                    "What would you like people to know about you?",
                    "Share a brief introduction of who you are..."
                ],
                childhood: [
                    "What are your earliest memories?",
                    "Where did you grow up and what was it like?",
                    "What games or activities did you enjoy as a child?",
                    "Who were your childhood friends and what did you do together?",
                    "What was your favorite toy or possession growing up?"
                ],
                family: [
                    "Tell us about your parents and siblings...",
                    "What family traditions do you remember?",
                    "How has your family influenced who you are today?",
                    "What family stories have been passed down through generations?",
                    "Describe a special family moment or celebration..."
                ],
                career: [
                    "What was your first job and how did you get it?",
                    "What career path did you choose and why?",
                    "What challenges did you face in your professional life?",
                    "What achievements are you most proud of in your career?",
                    "How has your career evolved over the years?"
                ],
                achievements: [
                    "What accomplishments are you most proud of?",
                    "What challenges have you overcome in your life?",
                    "What awards or recognition have you received?",
                    "What goals have you achieved that seemed impossible at first?",
                    "What legacy do you hope to leave behind?"
                ],
                wisdom: [
                    "What life lessons have you learned that you'd like to share?",
                    "What advice would you give to younger generations?",
                    "What values are most important to you?",
                    "How have your beliefs and perspectives changed over time?",
                    "What would you tell your younger self if you could?"
                ]
            };

            // Get context-aware prompts based on what's already written
            const getContextualPrompts = () => {
                const contextualPrompts = [];

                // Check if name is mentioned in overview
                if (formData.overview && formData.overview.length > 50) {
                    contextualPrompts.push("You've shared a good overview. Would you like to expand on any specific aspect of your life?");
                }

                // Check if childhood is mentioned in overview
                if (formData.overview && formData.overview.toLowerCase().includes('childhood') && !formData.childhood) {
                    contextualPrompts.push("I noticed you mentioned your childhood in the overview. Would you like to write a dedicated section about your early years?");
                }

                // Check if family is mentioned in overview
                if (formData.overview && formData.overview.toLowerCase().includes('family') && !formData.family) {
                    contextualPrompts.push("You mentioned your family in the overview. Would you like to tell us more about your family story?");
                }

                // Check if career is mentioned in overview
                if (formData.overview && formData.overview.toLowerCase().includes('career') && !formData.career) {
                    contextualPrompts.push("You touched on your career in the overview. Would you like to expand on your professional journey?");
                }

                // Cross-reference prompts
                if (formData.childhood && formData.childhood.length > 100 && !formData.family) {
                    contextualPrompts.push("You've shared wonderful childhood memories. How did your family shape those early experiences?");
                }

                if (formData.career && formData.career.length > 100 && !formData.achievements) {
                    contextualPrompts.push("You've described your career journey. What specific achievements or milestones stand out to you?");
                }

                if (formData.family && formData.family.length > 100 && !formData.wisdom) {
                    contextualPrompts.push("Your family stories are touching. What wisdom have you gained from your family experiences?");
                }

                return contextualPrompts;
            };

            // Get progress-based prompts
            const getProgressPrompts = () => {
                const totalSections = 6; // overview, childhood, family, career, achievements, wisdom
                const completedSections = Object.values(formData).filter(value =>
                    typeof value === 'string' && value.trim().length > 50
                ).length;

                const progressPercentage = (completedSections / totalSections) * 100;

                if (progressPercentage < 25) {
                    return ["You're just getting started! What would you like to share first about your life story?"];
                } else if (progressPercentage < 50) {
                    return ["Great progress! You're building a wonderful story. What aspect would you like to explore next?"];
                } else if (progressPercentage < 75) {
                    return ["You're more than halfway there! What else would you like to add to complete your story?"];
                } else {
                    return ["Almost there! Is there anything else you'd like to share to complete your biography?"];
                }
            };

            // Get personalized prompts based on user's name
            const getPersonalizedPrompts = () => {
                if (formData.name) {
                    return [
                        `Hi ${formData.name}! What would you like to share about your life journey?`,
                        `${formData.name}, what story would you like to tell today?`,
                        `Let's continue ${formData.name}'s story. What's on your mind?`
                    ];
                }
                return [];
            };

            // Combine all prompt types
            const allPrompts = [
                ...getContextualPrompts(),
                ...getProgressPrompts(),
                ...getPersonalizedPrompts(),
                ...(basePrompts[section] || basePrompts.overview)
            ];

            // Remove duplicates and return unique prompts
            return [...new Set(allPrompts)].slice(0, 8); // Limit to 8 prompts
        };

        // Enhanced prompt selection handler
        const handlePromptSelect = (prompt) => {
            // Update writing streak when user selects a prompt
            updateWritingStreak();

            // Insert the prompt at cursor position or append to current content
            const currentContent = formData[currentSection] || '';
            const newContent = currentContent + (currentContent ? '\n\n' : '') + prompt;

            handleInputChange(currentSection, newContent);

            // Close prompts panel
            setShowWritingPrompts(false);

            // Trigger auto-save
            triggerAutoSave({
                ...formData,
                [currentSection]: newContent
            });
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

        // Enhanced auto-save with smart timing and recovery
        const triggerAutoSave = (updatedData = null) => {
            // Clear existing timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Set unsaved changes flag
            setUnsavedChanges(true);

            // Set new timer for 2 seconds after inactivity
            autoSaveTimerRef.current = setTimeout(async() => {
                if (!user) return;

                const dataToSave = updatedData || {
                    formData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                };

                console.log('Smart auto-save triggered after 2 seconds of inactivity');
                setAutoSaveStatus('saving');

                try {
                    const success = await saveUserData(user.uid, dataToSave);

                    if (success) {
                        setAutoSaveStatus('saved');
                        setUnsavedChanges(false);
                        setLastSaveTime(new Date().toISOString());

                        // Add to save history (keep last 5 versions)
                        const newSaveEntry = {
                            timestamp: new Date().toISOString(),
                            data: JSON.parse(JSON.stringify(dataToSave)), // Deep copy
                            version: saveHistory.length + 1
                        };

                        setSaveHistory(prev => {
                            const updated = [newSaveEntry, ...prev.slice(0, 4)]; // Keep only last 5
                            return updated;
                        });

                        // Store in localStorage for recovery
                        localStorage.setItem(`biography_draft_${user.uid}`, JSON.stringify({
                            data: dataToSave,
                            timestamp: new Date().toISOString()
                        }));

                        console.log('Smart auto-save successful');
                    } else {
                        setAutoSaveStatus('error');
                        console.error('Smart auto-save failed');
                    }
                } catch (error) {
                    console.error('Smart auto-save error:', error);
                    setAutoSaveStatus('error');
                }
            }, 2000); // 2 seconds delay
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

        const exportBiography = async(format) => {
            if (!user) {
                console.error('No user logged in');
                return;
            }

            setIsLoading(true);
            setAutoSaveStatus('saving');

            try {
                // Auto-save current data before exporting
                console.log('Auto-saving before export...');
                const saveSuccess = await saveUserData(user.uid, {
                    formData,
                    photos,
                    recordings,
                    writingStreak,
                    lastWriteDate,
                    updatedAt: new Date().toISOString()
                });

                if (!saveSuccess) {
                    console.error('Failed to save data before export');
                    setAutoSaveStatus('error');
                    setIsLoading(false);
                    return;
                }

                setAutoSaveStatus('saved');
                console.log('Data saved successfully before export');

                // Proceed with enhanced export
                setTimeout(() => {
                    let content = '';
                    let filename = '';
                    let mimeType = 'text/plain';

                    switch (format) {
                        case 'pdf':
                            content = generateBeautifulPDF();
                            filename = `${formData.name || 'My'}_Biography.pdf`;
                            mimeType = 'application/pdf';
                            break;
                        case 'word':
                            content = generateWordDocument();
                            filename = `${formData.name || 'My'}_Biography.docx`;
                            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                            break;
                        case 'web':
                            content = generateInteractiveHTML();
                            filename = `${formData.name || 'My'}_Biography.html`;
                            mimeType = 'text/html';
                            break;
                        case 'email':
                            content = generateEmailFormat();
                            filename = `${formData.name || 'My'}_Biography_Email.txt`;
                            mimeType = 'text/plain';
                            break;
                        case 'epub':
                            content = generateEPUB();
                            filename = `${formData.name || 'My'}_Biography.epub`;
                            mimeType = 'application/epub+zip';
                            break;
                        default:
                            break;
                    }

                    const blob = new Blob([content], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    setIsLoading(false);
                }, 1000);

            } catch (error) {
                console.error('Error during export with auto-save:', error);
                setAutoSaveStatus('error');
                setIsLoading(false);
            }
        };

        // Enhanced export format generators
        const generateBeautifulPDF = () => {
                const template = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${formData.name || 'My'} Biography</title>
                    <style>
                        body { font-family: 'Georgia', serif; line-height: 1.6; margin: 0; padding: 40px; background: #fafafa; }
                        .container { max-width: 800px; margin: 0 auto; background: white; padding: 60px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                        .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 30px; margin-bottom: 40px; }
                        h1 { color: #2c3e50; font-size: 2.5em; margin: 0; }
                        .subtitle { color: #7f8c8d; font-size: 1.2em; margin: 10px 0; }
                        .section { margin: 40px 0; }
                        .section h2 { color: #34495e; border-left: 4px solid #3498db; padding-left: 20px; }
                        .content { text-align: justify; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #ecf0f1; color: #7f8c8d; }
                        @media print { body { background: white; } .container { box-shadow: none; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${formData.name || 'My Life Story'}</h1>
                            <div class="subtitle">A Journey Through Time</div>
                        </div>
                        
                        ${formData.overview ? `<div class="section">
                            <h2>Overview</h2>
                            <div class="content">${formData.overview.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        ${formData.childhood ? `<div class="section">
                            <h2>Childhood</h2>
                            <div class="content">${formData.childhood.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        ${formData.family ? `<div class="section">
                            <h2>Family</h2>
                            <div class="content">${formData.family.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        ${formData.career ? `<div class="section">
                            <h2>Career</h2>
                            <div class="content">${formData.career.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        ${formData.achievements ? `<div class="section">
                            <h2>Achievements</h2>
                            <div class="content">${formData.achievements.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        ${formData.wisdom ? `<div class="section">
                            <h2>Wisdom & Life Lessons</h2>
                            <div class="content">${formData.wisdom.replace(/\n/g, '<br>')}</div>
                        </div>` : ''}
                        
                        <div class="footer">
                            <p>Generated on ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            return template;
        };

        const generateWordDocument = () => {
            return `Name: ${formData.name || 'My Life Story'}

OVERVIEW
${formData.overview || 'No overview provided'}

CHILDHOOD
${formData.childhood || 'No childhood memories provided'}

FAMILY
${formData.family || 'No family information provided'}

CAREER
${formData.career || 'No career information provided'}

ACHIEVEMENTS
${formData.achievements || 'No achievements listed'}

WISDOM & LIFE LESSONS
${formData.wisdom || 'No wisdom shared'}

Generated on: ${new Date().toLocaleDateString()}`;
        };

        const generateInteractiveHTML = () => {
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${formData.name || 'My'} Biography</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1000px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 40px; text-align: center; }
        h1 { margin: 0; font-size: 3em; }
        .nav { background: #ecf0f1; padding: 20px; display: flex; justify-content: center; gap: 20px; }
        .nav button { padding: 10px 20px; border: none; background: #3498db; color: white; cursor: pointer; border-radius: 5px; }
        .nav button:hover { background: #2980b9; }
        .content { padding: 40px; }
        .section { display: none; }
        .section.active { display: block; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .search { margin: 20px 0; }
        .search input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formData.name || 'My Life Story'}</h1>
            <p>An Interactive Biography</p>
        </div>
        
        <div class="nav">
            <button onclick="showSection('overview')">Overview</button>
            <button onclick="showSection('childhood')">Childhood</button>
            <button onclick="showSection('family')">Family</button>
            <button onclick="showSection('career')">Career</button>
            <button onclick="showSection('achievements')">Achievements</button>
            <button onclick="showSection('wisdom')">Wisdom</button>
        </div>
        
        <div class="content">
            <div class="search">
                <input type="text" id="searchInput" placeholder="Search in biography..." onkeyup="searchContent()">
            </div>
            
            <div id="overview" class="section active">
                <h2>Overview</h2>
                <p>${formData.overview || 'No overview provided'}</p>
            </div>
            
            <div id="childhood" class="section">
                <h2>Childhood</h2>
                <p>${formData.childhood || 'No childhood memories provided'}</p>
            </div>
            
            <div id="family" class="section">
                <h2>Family</h2>
                <p>${formData.family || 'No family information provided'}</p>
            </div>
            
            <div id="career" class="section">
                <h2>Career</h2>
                <p>${formData.career || 'No career information provided'}</p>
            </div>
            
            <div id="achievements" class="section">
                <h2>Achievements</h2>
                <p>${formData.achievements || 'No achievements listed'}</p>
            </div>
            
            <div id="wisdom" class="section">
                <h2>Wisdom & Life Lessons</h2>
                <p>${formData.wisdom || 'No wisdom shared'}</p>
            </div>
        </div>
    </div>
    
    <script>
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
        }
        
        function searchContent() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const sections = document.querySelectorAll('.section');
            
            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    section.style.display = 'block';
                    if (searchTerm) {
                        section.style.backgroundColor = '#fff3cd';
                    } else {
                        section.style.backgroundColor = 'transparent';
                    }
                } else if (searchTerm) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                    section.style.backgroundColor = 'transparent';
                }
            });
        }
    </script>
</body>
</html>`;
        };

        const generateEmailFormat = () => {
            return `Subject: ${formData.name || 'My'} Biography

Dear [Recipient],

I wanted to share my life story with you. Here's a brief overview:

NAME: ${formData.name || 'Not provided'}

OVERVIEW:
${formData.overview || 'No overview provided'}

CHILDHOOD:
${formData.childhood || 'No childhood memories provided'}

FAMILY:
${formData.family || 'No family information provided'}

CAREER:
${formData.career || 'No career information provided'}

ACHIEVEMENTS:
${formData.achievements || 'No achievements listed'}

WISDOM & LIFE LESSONS:
${formData.wisdom || 'No wisdom shared'}

Best regards,
${formData.name || 'The Author'}

Generated on: ${new Date().toLocaleDateString()}`;
        };

        const generateEPUB = () => {
            // Simplified EPUB format (basic structure)
            return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${formData.name || 'My'} Biography</dc:title>
        <dc:creator>${formData.name || 'The Author'}</dc:creator>
        <dc:language>en</dc:language>
        <dc:identifier>biography-${Date.now()}</dc:identifier>
    </metadata>
    <manifest>
        <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>
        <item id="overview" href="overview.xhtml" media-type="application/xhtml+xml"/>
    </manifest>
    <spine>
        <itemref idref="toc"/>
        <itemref idref="overview"/>
    </spine>
</package>`;
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

        // Check for draft recovery on component mount
        useEffect(() => {
            if (user) {
                const savedDraft = localStorage.getItem(`biography_draft_${user.uid}`);
                if (savedDraft) {
                    try {
                        const draft = JSON.parse(savedDraft);
                        const draftAge = new Date() - new Date(draft.timestamp);
                        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

                        // Only show recovery if draft is less than 1 hour old
                        if (draftAge < oneHour) {
                            setRecoveryData(draft);
                            setShowRecoveryDialog(true);
                        } else {
                            // Clear old drafts
                            localStorage.removeItem(`biography_draft_${user.uid}`);
                        }
                    } catch (error) {
                        console.error('Error parsing saved draft:', error);
                        localStorage.removeItem(`biography_draft_${user.uid}`);
                    }
                }
            }
        }, [user]);

        // Warn user before leaving with unsaved changes
        useEffect(() => {
            const handleBeforeUnload = (e) => {
                if (unsavedChanges) {
                    e.preventDefault();
                    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                    return e.returnValue;
                }
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }, [unsavedChanges]);

        // Recovery functions
        const recoverDraft = () => {
            if (recoveryData) {
                setFormData(recoveryData.data.formData || formData);
                setPhotos(recoveryData.data.photos || photos);
                setRecordings(recoveryData.data.recordings || recordings);
                setWritingStreak(recoveryData.data.writingStreak || writingStreak);
                setLastWriteDate(recoveryData.data.lastWriteDate || lastWriteDate);
                setShowRecoveryDialog(false);
                setRecoveryData(null);
                console.log('Draft recovered successfully');
            }
        };

        const discardDraft = () => {
            if (user) {
                localStorage.removeItem(`biography_draft_${user.uid}`);
                setShowRecoveryDialog(false);
                setRecoveryData(null);
                console.log('Draft discarded');
            }
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
                WritingPrompts 
                    onPromptSelect={handlePromptSelect} 
                    currentSection={currentSection}
                    formData={formData}
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
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-amber-50 to-orange-100'}`}>
                {/* Draft Recovery Dialog */}
                {showRecoveryDialog && recoveryData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Save className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Draft Found!</h3>
                                    <p className="text-sm text-gray-600">We found an unsaved draft from your last session.</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Last saved:</strong> {new Date(recoveryData.timestamp).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Would you like to recover this draft or start fresh?
                                </p>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={recoverDraft}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Recover Draft
                                </button>
                                <button
                                    onClick={discardDraft}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Start Fresh
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default BiographyApp;