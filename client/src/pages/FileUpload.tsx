import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]; // Safely access the file
        if (selectedFile) {
            setFile(selectedFile);
        }

    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8080/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('File uploaded successfully');
            setError('');
            console.log(response.data);  // Logs the response from server

        } catch (error) {
            setError('File upload failed');
            setMessage('');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>File Upload</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload File</button>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default FileUpload;
