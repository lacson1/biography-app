import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    position = 'top-right'
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconColors = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
    };

    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const Icon = icons[type];

    return ( <
        div className = { `fixed ${positions[position]} z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }` } >
        <
        div className = { `flex items-center p-4 rounded-lg border shadow-lg max-w-sm ${colors[type]}` } >
        <
        Icon className = { `h-5 w-5 mr-3 ${iconColors[type]}` }
        /> <
        span className = "flex-1 text-sm font-medium" > { message } < /span> <
        button onClick = {
            () => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }
        }
        className = "ml-3 text-gray-400 hover:text-gray-600 transition-colors" >
        <
        X className = "h-4 w-4" / >
        <
        /button> < /
        div > <
        /div>
    );
};

export default Toast;