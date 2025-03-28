import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://js-master.onrender.com';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            try {
                console.log('Environment variables:', {
                    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
                    API_URL
                });
                
                const fullUrl = `${API_URL}/api/code-blocks`;
                console.log('Attempting to fetch from:', fullUrl);
                
                const response = await axios.get(fullUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                });
                
                console.log('Server response:', response.data);
                
                if (response.data && Array.isArray(response.data)) {
                    if (response.data.length === 0) {
                        setError('No code blocks found');
                    } else {
                        setCodeBlocks(response.data);
                    }
                } else {
                    setError('Invalid data format received from server');
                    console.error('Invalid data format:', response.data);
                }
            } catch (error) {
                let errorMessage = 'Connection error';
                if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out - server might be starting up, please try again';
                } else if (error.response) {
                    errorMessage = `Server error: ${error.response.status}`;
                } else if (error.request) {
                    errorMessage = 'No response from server';
                }
                setError(errorMessage);
                console.error('Full error details:', {
                    message: error.message,
                    response: error.response,
                    config: error.config,
                    stack: error.stack
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCodeBlocks();
    }, []);

    const handleCodeBlockClick = (title) => {
        navigate(`/code-block/${encodeURIComponent(title)}`);
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        const fetchData = async () => {
            try {
                console.log('Environment variables:', {
                    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
                    API_URL
                });
                
                const fullUrl = `${API_URL}/api/code-blocks`;
                console.log('Attempting to fetch from:', fullUrl);
                
                const response = await axios.get(fullUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log('Server response:', response.data);
                
                if (response.data && Array.isArray(response.data)) {
                    if (response.data.length === 0) {
                        setError('No code blocks found');
                    } else {
                        setCodeBlocks(response.data);
                    }
                } else {
                    setError('Invalid data format received from server');
                    console.error('Invalid data format:', response.data);
                }
            } catch (error) {
                let errorMessage = 'Connection error';
                if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out - server might be starting up, please try again';
                } else if (error.response) {
                    errorMessage = `Server error: ${error.response.status}`;
                } else if (error.request) {
                    errorMessage = 'No response from server';
                }
                setError(errorMessage);
                console.error('Full error details:', {
                    message: error.message,
                    response: error.response,
                    config: error.config,
                    stack: error.stack
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading code blocks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Code Blocks</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose code block
                    </h1>
                    <p className="text-xl text-gray-600">
                        Master Your JavaScript Skills With Tom Help
                    </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {codeBlocks.map((block, index) => (
                        <div
                            key={block.title}
                            onClick={() => handleCodeBlockClick(block.title)}
                            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {block.title}
                                </h2>
                                <span className="text-blue-600">
                                    →
                                </span>
                            </div>
                            <p className="text-gray-600">
                                {block.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lobby; 