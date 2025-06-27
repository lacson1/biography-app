import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Calendar,
    Clock,
    Target,
    Award,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';

const WritingInsights = ({ formData, writingStreak, lastWriteDate }) => {
    const [insights, setInsights] = useState({
        totalWords: 0,
        totalCharacters: 0,
        sectionsCompleted: 0,
        averageWordsPerSection: 0,
        mostActiveSection: '',
        writingFrequency: 'daily',
        completionRate: 0
    });

    useEffect(() => {
        calculateInsights();
    }, [formData]);

    const calculateInsights = () => {
        const sections = ['overview', 'childhood', 'family', 'career', 'achievements', 'wisdom'];
        let totalWords = 0;
        let totalCharacters = 0;
        let completedSections = 0;
        let sectionWordCounts = {};

        sections.forEach(section => {
            const content = formData[section] || '';
            const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
            const characters = content.length;

            totalWords += words;
            totalCharacters += characters;
            sectionWordCounts[section] = words;

            if (words > 50) completedSections++;
        });

        const mostActiveSection = Object.entries(sectionWordCounts)
            .sort(([, a], [, b]) => b - a)[0] ? .[0] || '';

        const completionRate = (completedSections / sections.length) * 100;

        setInsights({
            totalWords,
            totalCharacters,
            sectionsCompleted: completedSections,
            averageWordsPerSection: Math.round(totalWords / sections.length),
            mostActiveSection,
            writingFrequency: getWritingFrequency(),
            completionRate: Math.round(completionRate)
        });
    };

    const getWritingFrequency = () => {
        if (!lastWriteDate) return 'new';

        const daysSinceLastWrite = Math.floor((Date.now() - new Date(lastWriteDate)) / (1000 * 60 * 60 * 24));

        if (daysSinceLastWrite === 0) return 'today';
        if (daysSinceLastWrite === 1) return 'yesterday';
        if (daysSinceLastWrite <= 3) return 'recent';
        if (daysSinceLastWrite <= 7) return 'weekly';
        return 'occasional';
    };

    const getWritingAdvice = () => {
        const { totalWords, completionRate, writingFrequency } = insights;

        if (totalWords < 100) {
            return "Start with small stories. Try writing about your favorite childhood memory.";
        }
        if (completionRate < 30) {
            return "Focus on completing one section at a time. Quality over quantity!";
        }
        if (writingFrequency === 'occasional') {
            return "Try writing a little each day to build momentum and consistency.";
        }
        if (totalWords > 1000) {
            return "Great progress! Consider adding photos and recordings to enrich your story.";
        }

        return "Keep writing! Every word adds to your life's narrative.";
    };

    const getMotivationalMessage = () => {
        const { totalWords, writingStreak } = insights;

        if (writingStreak >= 7) {
            return "🔥 Amazing! You're on fire with your writing streak!";
        }
        if (totalWords > 500) {
            return "📚 You're building a beautiful legacy with your words.";
        }
        if (writingStreak > 0) {
            return "💪 Keep the momentum going! Every day counts.";
        }

        return "🌟 Start your writing journey today. Your story matters.";
    };

    return ( <
            div className = "bg-white rounded-xl shadow-lg p-6" >
            <
            div className = "flex items-center justify-between mb-6" >
            <
            div className = "flex items-center space-x-3" >
            <
            div className = "p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" >
            <
            BarChart3 className = "h-6 w-6 text-white" / >
            <
            /div> <
            h2 className = "text-2xl font-bold text-gray-800" > Writing Insights < /h2> < /
            div > <
            div className = "text-sm text-gray-500" >
            Last updated: { new Date().toLocaleDateString() } <
            /div> < /
            div >

            { /* Key Metrics */ } <
            div className = "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" >
            <
            div className = "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4" >
            <
            div className = "flex items-center justify-between" >
            <
            div >
            <
            p className = "text-sm text-gray-600" > Total Words < /p> <
            p className = "text-2xl font-bold text-gray-800" > { insights.totalWords.toLocaleString() } < /p> < /
            div > <
            TrendingUp className = "h-8 w-8 text-blue-500" / >
            <
            /div> < /
            div >

            <
            div className = "bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4" >
            <
            div className = "flex items-center justify-between" >
            <
            div >
            <
            p className = "text-sm text-gray-600" > Sections < /p> <
            p className = "text-2xl font-bold text-gray-800" > { insights.sectionsCompleted }
            /6</p >
            <
            /div> <
            Target className = "h-8 w-8 text-green-500" / >
            <
            /div> < /
            div >

            <
            div className = "bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4" >
            <
            div className = "flex items-center justify-between" >
            <
            div >
            <
            p className = "text-sm text-gray-600" > Streak < /p> <
            p className = "text-2xl font-bold text-gray-800" > { writingStreak }
            days < /p> < /
            div > <
            Award className = "h-8 w-8 text-purple-500" / >
            <
            /div> < /
            div >

            <
            div className = "bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4" >
            <
            div className = "flex items-center justify-between" >
            <
            div >
            <
            p className = "text-sm text-gray-600" > Progress < /p> <
            p className = "text-2xl font-bold text-gray-800" > { insights.completionRate } % < /p> < /
            div > <
            Activity className = "h-8 w-8 text-amber-500" / >
            <
            /div> < /
            div > <
            /div>

            { /* Writing Advice */ } <
            div className = "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6" >
            <
            div className = "flex items-start space-x-3" >
            <
            div className = "p-2 bg-blue-500 rounded-lg flex-shrink-0" >
            <
            Target className = "h-5 w-5 text-white" / >
            <
            /div> <
            div >
            <
            h3 className = "text-lg font-semibold text-gray-800 mb-2" > Writing Advice < /h3> <
            p className = "text-gray-700" > { getWritingAdvice() } < /p> < /
            div > <
            /div> < /
            div >

            { /* Motivational Message */ } <
            div className = "bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6" >
            <
            div className = "flex items-start space-x-3" >
            <
            div className = "p-2 bg-green-500 rounded-lg flex-shrink-0" >
            <
            Award className = "h-5 w-5 text-white" / >
            <
            /div> <
            div >
            <
            h3 className = "text-lg font-semibold text-gray-800 mb-2" > Keep Going! < /h3> <
            p className = "text-gray-700" > { getMotivationalMessage() } < /p> < /
            div > <
            /div> < /
            div >

            { /* Section Progress */ } <
            div className = "space-y-4" >
            <
            h3 className = "text-lg font-semibold text-gray-800" > Section Progress < /h3> { ['overview', 'childhood', 'family', 'career', 'achievements', 'wisdom'].map((section) => {
                const content = formData[section] || '';
                const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
                const progress = Math.min((words / 100) * 100, 100);
                const isCompleted = words >= 50;

                return ( <
                    div key = { section }
                    className = "space-y-2" >
                    <
                    div className = "flex items-center justify-between" >
                    <
                    span className = "text-sm font-medium text-gray-700 capitalize" > { section } <
                    /span> <
                    span className = "text-sm text-gray-500" > { words }
                    words <
                    /span> < /
                    div > <
                    div className = "w-full bg-gray-200 rounded-full h-2" >
                    <
                    div className = { `h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }` }
                    style = {
                        { width: `${progress}%` }
                    }
                    /> < /
                    div > <
                    /div>
                );
            })
        } <
        /div>

    { /* Writing Stats */ } <
    div className = "mt-6 pt-6 border-t border-gray-200" >
        <
        h3 className = "text-lg font-semibold text-gray-800 mb-4" > Writing Statistics < /h3> <
    div className = "grid grid-cols-2 gap-4 text-sm" >
        <
        div >
        <
        span className = "text-gray-600" > Total Characters: < /span> <
    span className = "ml-2 font-medium" > { insights.totalCharacters.toLocaleString() } < /span> < /
        div > <
        div >
        <
        span className = "text-gray-600" > Avg Words / Section: < /span> <
    span className = "ml-2 font-medium" > { insights.averageWordsPerSection } < /span> < /
        div > <
        div >
        <
        span className = "text-gray-600" > Most Active: < /span> <
    span className = "ml-2 font-medium capitalize" > { insights.mostActiveSection || 'None' } < /span> < /
        div > <
        div >
        <
        span className = "text-gray-600" > Frequency: < /span> <
    span className = "ml-2 font-medium capitalize" > { insights.writingFrequency } < /span> < /
        div > <
        /div> < /
        div > <
        /div>
);
};

export default WritingInsights;