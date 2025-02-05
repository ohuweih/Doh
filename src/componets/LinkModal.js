import React, { useState } from 'react';
import { Editor, Transforms, Range } from 'slate';

const LinkModal = ({ editor, onClose }) => {
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');

    const handleInsertLink = () => {
        if (!url.trim()) return;

       
        const { selection } = editor;
        const selectedText =
            selection && !Range.isCollapsed(selection)
                ? Editor.string(editor, selection) 
                : description.trim() || "Description" 

        const linkSyntax = `link:${url}[${selectedText}]`;

        Transforms.insertText(editor, linkSyntax);

        onClose();
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleInsertLink();
        }
    };

    return (
        <div className="link-modal-overlay">
            <div className="link-modal">
                <h3>Insert Link</h3>
                <input
                    type="text"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <input
                    type="text"
                    placeholder="Enter Link Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="link-modal-actions">
                    <button onClick={handleInsertLink}>Insert</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default LinkModal;
