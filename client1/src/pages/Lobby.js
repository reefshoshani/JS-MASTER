import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/code-blocks');
                setCodeBlocks(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching code blocks:', error);
                setLoading(false);
            }
        };

        fetchCodeBlocks();
    }, []);

    const handleCodeBlockClick = (title) => {
        navigate(`/code-block/${encodeURIComponent(title)}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                        Master Your JavaScript Skills Through Interactive Challenges
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