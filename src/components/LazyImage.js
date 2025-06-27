import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const LazyImage = ({
    src,
    alt,
    className = "",
    placeholder = null,
    fallback = null,
    onLoad = null,
    onError = null
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        if (!imgRef.current) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observerRef.current.disconnect();
                }
            }, { threshold: 0.1 }
        );

        observerRef.current.observe(imgRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setHasError(true);
        if (onError) onError();
    };

    if (hasError && fallback) {
        return ( <
            div className = { `flex items-center justify-center bg-gray-100 ${className}` } >
            <
            ImageIcon className = "h-8 w-8 text-gray-400" / >
            <
            span className = "ml-2 text-sm text-gray-500" > { alt } < /span> < /
            div >
        );
    }

    return ( <
        div ref = { imgRef }
        className = { `relative overflow-hidden ${className}` } > { /* Placeholder */ } {
            !isLoaded && placeholder && ( <
                div className = "absolute inset-0 flex items-center justify-center bg-gray-100" > { placeholder } <
                /div>
            )
        }

        { /* Loading skeleton */ } {
            !isLoaded && !placeholder && ( <
                div className = "absolute inset-0 loading-skeleton" / >
            )
        }

        { /* Actual image */ } {
            isInView && ( <
                img src = { src }
                alt = { alt }
                onLoad = { handleLoad }
                onError = { handleError }
                className = { `w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }` }
                />
            )
        } <
        /div>
    );
};

export default LazyImage;