import React, { useState } from 'react';

const ExportModal = ({ value, onClose }) => {
    const [fileName, setFileName] = useState("document");

    const handleExport = () => {
        if (!value || !Array.isArray(value)) {
            console.error("Editor content is undefined or not an array");
            return;
        }

        const content = value.map(n => n.children.map(child => child.text).join("")).join("\n");

        if (!content.trim()) {
            alert("Cannot export an empty file!");
            return;
        }

        const safeFileName = fileName.trim() ? fileName.trim() : "document";

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeFileName}.adoc`; // Use custom file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Free memory

        console.log("Export completed. Closing modal...");

        if (typeof onClose === 'function') {
            onClose();
        }
    };

    return (
        <div className="export-modal-overlay">
            <div className="export-modal">
                <h3>Export AsciiDoc</h3>
                <input
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
                <div className="export-modal-actions">
                    <button onClick={handleExport}>Export</button>
                    <button onClick={() => typeof onClose === 'function' && onClose()}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
