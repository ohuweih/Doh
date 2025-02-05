import React, { useState, useEffect } from 'react';
import { Transforms } from 'slate';
import { FaImage } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const maxFileSize = 2;
const maxUploadsPerSession = 10;

const ImageUploadButton = ({ editor }) => {
    const [sessionToken, setSessionToken] = useState('');
    const [uploadsCount, setUploadsCount] = useState(0);

    useEffect(() => {
        let token = sessionStorage.getItem('sessionToken');
        if (!token) {
            token = uuidv4();
            sessionStorage.setItem('sessionToekn', token);
        }

        setSessionToken(token);

        const uploads = parseInt(sessionStorage.getItem('uploadsCount')) || 0;
        setUploadsCount(uploads);
    }, []);

    const handleImageUpload = (event) => {
        console.log("Running image upload")
        const file = event.target.files[0];

        if (!file) return;
        const fileSize = file.size / (1024 * 1024);
        if (fileSize > maxFileSize) {
            alert(`File is too large! <aximum size allowed is ${maxFileSize} MB.`);
            return;
        }

        if (uploadsCount >= maxUploadsPerSession) {
            alert(`You have reached the maximum of ${maxUploadsPerSession} uploads for this session.`);
            return;
        }
        console.log('file size', fileSize)
        const imageUrl = URL.createObjectURL(file);
        const imageSyntax =  `image::${imageUrl}[Uploaded Image]`;

        Transforms.insertText(editor, imageSyntax);

    
    };

    return (
        <label className="toolbar-button">
            <FaImage />
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none'}}
            />
        </label>
    );
};

export default ImageUploadButton;