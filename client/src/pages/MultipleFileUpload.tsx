import React, { useState } from 'react';
import axios from '../utils/axios';

const MultipleFileUpload = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFiles(selectedFiles);
        }
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!files || files.length === 0) {
            setError('Please select at least one file!');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await axios.post(`/upload/multiple`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('File uploaded successfully');
            setError('');
            console.log(response.data);
        } catch (error) {
            setError('File upload failed');
            setMessage('');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Multiple File Upload</h2>
            <input type="file" name="files" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Files</button>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default MultipleFileUpload;
