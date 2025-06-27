import React, { useState, useRef, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Link,
    Image as ImageIcon,
    Save,
    Undo,
    Redo
} from 'lucide-react';

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Start writing...",
    className = "",
    readOnly = false
}) => {
    const editorRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        updateContent();
    };

    const updateContent = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);

            // Update undo/redo state
            setCanUndo(document.queryCommandEnabled('undo'));
            setCanRedo(document.queryCommandEnabled('redo'));
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const insertImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    const toolbarButtons = [
        { icon: Bold, command: 'bold', label: 'Bold' },
        { icon: Italic, command: 'italic', label: 'Italic' },
        { icon: Underline, command: 'underline', label: 'Underline' },
        { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', label: 'Quote' },
        { icon: Link, action: insertLink, label: 'Insert Link' },
        { icon: ImageIcon, action: insertImage, label: 'Insert Image' }
    ];

    return ( <
        div className = { `border-2 rounded-lg transition-colors ${
      isFocused 
        ? 'border-blue-500 ring-2 ring-blue-200' 
        : 'border-gray-200 hover:border-gray-300'
    } ${className}` } > { /* Toolbar */ } {
            !readOnly && ( <
                div className = "flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg" >
                <
                button onClick = {
                    () => execCommand('undo')
                }
                disabled = {!canUndo }
                className = "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title = "Undo" >
                <
                Undo className = "h-4 w-4" / >
                <
                /button> <
                button onClick = {
                    () => execCommand('redo')
                }
                disabled = {!canRedo }
                className = "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title = "Redo" >
                <
                Redo className = "h-4 w-4" / >
                <
                /button>

                <
                div className = "w-px h-6 bg-gray-300 mx-2" / >

                {
                    toolbarButtons.map((button, index) => ( <
                        button key = { index }
                        onClick = {
                            () => button.action ? button.action() : execCommand(button.command, button.value)
                        }
                        className = "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title = { button.label } >
                        <
                        button.icon className = "h-4 w-4" / >
                        <
                        /button>
                    ))
                } <
                /div>
            )
        }

        { /* Editor */ } <
        div ref = { editorRef }
        contentEditable = {!readOnly }
        onInput = { updateContent }
        onFocus = {
            () => setIsFocused(true)
        }
        onBlur = {
            () => setIsFocused(false)
        }
        onPaste = { handlePaste }
        className = { `p-4 min-h-64 outline-none ${
          readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'
        }` }
        style = {
            {
                fontFamily: 'inherit',
                lineHeight: '1.6'
            }
        }
        data - placeholder = { placeholder }
        suppressContentEditableWarning = { true }
        />

        { /* Placeholder */ } {
            !value && !readOnly && ( <
                div className = "absolute top-0 left-0 p-4 text-gray-400 pointer-events-none" > { placeholder } <
                /div>
            )
        } <
        /div>
    );
};

export default RichTextEditor;