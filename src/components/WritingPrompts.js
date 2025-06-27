import React, { useState, useEffect } from 'react';
import { Lightbulb, Calendar, Target, Sparkles, Clock, BookOpen, Brain, Zap } from 'lucide-react';

const WritingPrompts = ({ onPromptSelect, currentSection, formData }) => {
        const [selectedCategory, setSelectedCategory] = useState('intelligent');
        const [currentPrompt, setCurrentPrompt] = useState(null);
        const [intelligentPrompts, setIntelligentPrompts] = useState([]);

        const promptCategories = {
            intelligent: {
                title: 'Smart Prompts',
                icon: Brain,
                color: 'from-purple-500 to-indigo-600',
                description: 'AI-powered suggestions based on your story'
            },
            daily: {
                title: 'Daily Prompts',
                icon: Calendar,
                color: 'from-blue-500 to-indigo-600',
                description: 'General writing prompts for any day'
            },
            childhood: {
                title: 'Childhood Memories',
                icon: BookOpen,
                color: 'from-pink-500 to-rose-600',
                description: 'Prompts about your early years'
            },
            family: {
                title: 'Family Stories',
                icon: Target,
                color: 'from-green-500 to-emerald-600',
                description: 'Family-related writing prompts'
            },
            wisdom: {
                title: 'Life Lessons',
                icon: Lightbulb,
                color: 'from-yellow-500 to-amber-600',
                description: 'Wisdom and life experience prompts'
            },
            achievements: {
                title: 'Proud Moments',
                icon: Sparkles,
                color: 'from-orange-500 to-red-600',
                description: 'Achievement and success prompts'
            }
        };

        // Enhanced intelligent prompts system
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

                if (!formData) return contextualPrompts;

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
                if (!formData) return [];

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
                if (formData && formData.name) {
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

        const traditionalPrompts = {
            daily: [
                "What was the most significant day of your life and why?",
                "Describe a time when you had to make a difficult decision.",
                "What's a skill or hobby you've always wanted to learn?",
                "Share a story about a friendship that changed your life.",
                "What's something you're grateful for today?",
                "Describe a place that holds special meaning for you.",
                "What's a challenge you overcame that made you stronger?",
                "Share a memory from your first job or career.",
                "What's a tradition in your family that you cherish?",
                "Describe a moment when you felt truly proud of yourself."
            ],
            childhood: [
                "What was your favorite toy as a child and why?",
                "Describe your first day of school.",
                "What games did you play with your friends?",
                "Share a memory about your childhood home.",
                "What was your favorite food when you were young?",
                "Describe a family vacation from your childhood.",
                "What scared you as a child?",
                "Share a story about your grandparents.",
                "What did you want to be when you grew up?",
                "Describe a birthday party you remember fondly."
            ],
            family: [
                "How did your parents meet?",
                "What's a family tradition you want to pass on?",
                "Describe a sibling relationship that shaped you.",
                "Share a story about your family's heritage.",
                "What's the best advice your parents gave you?",
                "Describe a family gathering you'll never forget.",
                "What's a family recipe that's special to you?",
                "Share a story about your children or grandchildren.",
                "What's something you learned from your family?",
                "Describe a family member who influenced you greatly."
            ],
            wisdom: [
                "What's the most important lesson life has taught you?",
                "What advice would you give to your younger self?",
                "What does success mean to you?",
                "How do you handle difficult times?",
                "What's something you've changed your mind about?",
                "What's a mistake you made that taught you something valuable?",
                "How do you stay motivated when things get tough?",
                "What's your philosophy on relationships?",
                "What do you think is the key to happiness?",
                "What legacy do you want to leave behind?"
            ],
            achievements: [
                "What accomplishment are you most proud of?",
                "Describe a goal you worked hard to achieve.",
                "What's a challenge you thought you couldn't overcome?",
                "Share a story about a time you helped someone else.",
                "What's an award or recognition you received?",
                "Describe a project you completed successfully.",
                "What's something you learned that changed your life?",
                "Share a story about overcoming fear.",
                "What's a skill you mastered through practice?",
                "Describe a moment when you felt unstoppable."
            ]
        };

        useEffect(() => {
            if (selectedCategory === 'intelligent') {
                const prompts = getIntelligentPrompts(currentSection);
                setIntelligentPrompts(prompts);
                if (prompts.length > 0) {
                    setCurrentPrompt(prompts[0]);
                }
            } else {
                const categoryPrompts = traditionalPrompts[selectedCategory] || traditionalPrompts.daily;
                const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
                setCurrentPrompt(categoryPrompts[randomIndex]);
            }
        }, [selectedCategory, currentSection, formData]);

        const generateNewPrompt = () => {
            if (selectedCategory === 'intelligent') {
                const prompts = getIntelligentPrompts(currentSection);
                const randomIndex = Math.floor(Math.random() * prompts.length);
                setCurrentPrompt(prompts[randomIndex]);
            } else {
                const categoryPrompts = traditionalPrompts[selectedCategory] || traditionalPrompts.daily;
                const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
                setCurrentPrompt(categoryPrompts[randomIndex]);
            }
        };

        const handlePromptSelect = () => {
            if (currentPrompt && onPromptSelect) {
                onPromptSelect(currentPrompt);
            }
        };

        return ( <
                div className = "bg-white rounded-xl shadow-lg p-6" >
                <
                div className = "flex items-center justify-between mb-6" >
                <
                div className = "flex items-center space-x-3" >
                <
                div className = "p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" >
                <
                Lightbulb className = "h-6 w-6 text-white" / >
                <
                /div> <
                h2 className = "text-2xl font-bold text-gray-800" > Writing Prompts < /h2> < /
                div > <
                button onClick = { generateNewPrompt }
                className = "flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200" >
                <
                Sparkles className = "h-4 w-4" / >
                <
                span > New Prompt < /span> < /
                button > <
                /div>

                { /* Category Tabs */ } <
                div className = "flex space-x-2 mb-6 overflow-x-auto" > {
                    Object.entries(promptCategories).map(([key, category]) => {
                            const Icon = category.icon;
                            return ( <
                                    button key = { key }
                                    onClick = {
                                        () => setSelectedCategory(key)
                                    }
                                    className = { `flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                                selectedCategory === key
                                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{category.title}</span>
                        </button>
                    );
                })}
            </div>

            {/* Current Prompt */}
            {currentPrompt && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Today's Writing Prompt
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                "{currentPrompt}"
                            </p>
                            <button
                                onClick={handlePromptSelect}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <Target className="h-4 w-4" />
                                <span>Use This Prompt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Writing Streak */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">Writing Streak</h4>
                            <p className="text-sm text-gray-600">Keep writing daily to build momentum!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-gray-500">days</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritingPrompts;