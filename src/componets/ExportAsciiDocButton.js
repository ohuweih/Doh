import React, { useState } from 'react';
import { FaFileExport } from 'react-icons/fa';
import ExportModal from './ExportModal';

const ExportAsciiDocButton = ({ value }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <button 
                className="toolbar-button" 
                onClick={() => setShowModal(true)} 
            >
                <FaFileExport />
            </button>

            {showModal && (
                <ExportModal 
                    value={value} 
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ExportAsciiDocButton;
