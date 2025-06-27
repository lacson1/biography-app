import React, { useState, useEffect } from 'react';
import { Lightbulb, Calendar, Target, Sparkles, Clock, BookOpen } from 'lucide-react';

const WritingPrompts = ({ onPromptSelect, currentSection }) => {
        const [selectedCategory, setSelectedCategory] = useState('daily');
        const [currentPrompt, setCurrentPrompt] = useState(null);

        const promptCategories = {
            daily: {
                title: 'Daily Prompts',
                icon: Calendar,
                color: 'from-blue-500 to-indigo-600'
            },
            childhood: {
                title: 'Childhood Memories',
                icon: BookOpen,
                color: 'from-pink-500 to-rose-600'
            },
            family: {
                title: 'Family Stories',
                icon: Target,
                color: 'from-green-500 to-emerald-600'
            },
            wisdom: {
                title: 'Life Lessons',
                icon: Lightbulb,
                color: 'from-yellow-500 to-amber-600'
            },
            achievements: {
                title: 'Proud Moments',
                icon: Sparkles,
                color: 'from-purple-500 to-violet-600'
            }
        };

        const prompts = {
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
            generateNewPrompt();
        }, [selectedCategory]);

        const generateNewPrompt = () => {
            const categoryPrompts = prompts[selectedCategory];
            const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
            setCurrentPrompt(categoryPrompts[randomIndex]);
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