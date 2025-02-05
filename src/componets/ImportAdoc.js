import React from 'react';
import { Transforms } from 'slate';
import { FaFileImport } from 'react-icons/fa';

const ImportAsciiDocButton = ({ editor }) => {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            Transforms.insertText(editor, text);
        };
        reader.readAsText(file);;
    };
    
    return (
        <label className="toolbar-button">
            <FaFileImport />
            <input
                type="file"
                accept=".adoc"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
        </label>
    );
};

export default ImportAsciiDocButton;