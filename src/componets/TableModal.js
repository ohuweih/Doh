import React, { useState } from 'react';

const TableModal = ({ onInsertTable, onClose }) => {
    const [rows, setRows] = useState(2);
    const [cols, setCols] = useState(2);

    const handleInsert = () => {
        onInsertTable(rows, cols);
        onClose(); // Close modal after inserting
    };

    return (
        <div className="table-modal-overlay">
            <div className="table-modal">
                <h3>Insert Table</h3>
                <label>
                    Rows:
                    <input type="number" min="1" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
                </label>
                <label>Columns:
                    <input type="number" min="1" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
                </label>
                <div className="table-modal-actions">
                    <button onClick={handleInsert}>Insert</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default TableModal;
