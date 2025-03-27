import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { io } from 'socket.io-client';

// Simple message component for chat
const ChatMessage = ({ message, isSelf }) => (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`rounded-lg px-4 py-2 max-w-[70%] ${
            isSelf ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}>
            <div>{message.message}</div>
            <div className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })}
            </div>
        </div>
    </div>
);

const CodeBlock = () => {
    // Basic state management
    const { title } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState(null);
    const [code, setCode] = useState('');
    const [isMentor, setIsMentor] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(-1);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showHint, setShowHint] = useState(false);
    
    // Refs
    const socketRef = useRef();
    const chatContainerRef = useRef(null);

    // Fetch code block data
    useEffect(() => {
        const getCodeBlock = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/code-blocks/${encodeURIComponent(title)}`);
                setCodeBlock(response.data);
                setCode(response.data.initialCode);
            } catch (error) {
                console.error('Error:', error);
                navigate('/');
            }
        };
        getCodeBlock();
    }, [title, navigate]);

    // Socket connection
    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join-room', title);

        // Socket event handlers
        socketRef.current.on('role-assigned', ({ isMentor: mentorStatus }) => {
            setIsMentor(mentorStatus);
        });

        socketRef.current.on('user-count', setUserCount);
        socketRef.current.on('code-update', setCode);
        socketRef.current.on('receive-message', message => setMessages(prev => [...prev, message]));

        socketRef.current.on('mentor-left', () => {
            setCode(codeBlock?.initialCode || '');
            navigate('/');
        });

        return () => socketRef.current.disconnect();
    }, [title, navigate, codeBlock]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle code changes
    const handleCodeChange = (value) => {
        setCode(value);
        socketRef.current.emit('code-change', { roomId: title, code: value });
        
        // Check solution
        if (codeBlock?.solution) {
            const cleanCode = str => str.trim().replace(/\s+/g, '').replace(/['"]/g, '"');
            const userCode = cleanCode(value);
            const solutionCode = cleanCode(codeBlock.solution);
            
            if (userCode === solutionCode) {
                setShowSuccess(true);
                
                // Create and show the success emoji
                const successEmoji = document.createElement('div');
                Object.assign(successEmoji.style, {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '100px',
                    zIndex: '9999',
                    transition: 'opacity 0.3s ease',
                    opacity: '0',
                    pointerEvents: 'none'
                });
                successEmoji.textContent = '😊';
                document.body.appendChild(successEmoji);

                // Simple fade in/out animation
                requestAnimationFrame(() => {
                    successEmoji.style.opacity = '1';
                    setTimeout(() => {
                        successEmoji.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(successEmoji), 300);
                    }, 1000);
                });

                setTimeout(() => setShowSuccess(false), 1500);
            }
        }
    };

    // Toggle hint
    const toggleHint = () => {
        setShowHint(!showHint);
    };

    // Send chat message
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socketRef.current.emit('send-message', {
            roomId: title,
            message: newMessage,
            sender: isMentor ? 'Mentor' : 'Student',
            role: isMentor ? 'mentor' : 'student'
        });
        setNewMessage('');
    };

    if (!codeBlock) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-grow bg-white rounded-lg shadow p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">{codeBlock.title}</h1>
                            <div className="flex gap-4">
                                <span className="px-3 py-1 rounded-full text-sm bg-blue-100">
                                    {isMentor === null ? (
                                        <span className="inline-block animate-pulse">Loading...</span>
                                    ) : (
                                        isMentor ? 'Mentor' : 'Student'
                                    )}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-purple-100">
                                    {Math.max(0, userCount - 1)} {userCount - 1 === 1 ? 'Student' : 'Students'} Online
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="mb-6">{codeBlock.description}</p>

                        {/* Code Editor */}
                        <div className="relative">
                            <CodeMirror
                                value={code}
                                height="400px"
                                extensions={[javascript()]}
                                onChange={handleCodeChange}
                                editable={!isMentor}
                                theme="light"
                            />
                        </div>

                        {/* Hints */}
                        {!isMentor && codeBlock.hints && (
                            <div className="mt-4">
                                <button
                                    onClick={toggleHint}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    {showHint ? 'Hide Hint' : 'Show Hint'}
                                </button>
                                {showHint && codeBlock.hints[0] && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded">
                                        <h3 className="font-semibold mb-2">Hint:</h3>
                                        <p className="text-gray-700">{codeBlock.hints[0].text}</p>
                                        {codeBlock.hints[0].code && (
                                            <pre className="bg-white p-3 mt-2 rounded border">
                                                <code className="text-sm">{codeBlock.hints[0].code}</code>
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Solution for mentor */}
                        {isMentor && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded">
                                <h3>Solution:</h3>
                                <pre className="bg-white p-4 mt-2 rounded">
                                    <code>{codeBlock.solution}</code>
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Chat */}
                    <div className="w-80 bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold mb-4">Chat</h3>
                        <div 
                            ref={chatContainerRef} 
                            className="h-[500px] overflow-y-auto mb-4 p-4 border rounded"
                        >
                            {messages.map((msg, i) => (
                                <ChatMessage 
                                    key={i} 
                                    message={msg} 
                                    isSelf={msg.sender === (isMentor ? 'Mentor' : 'Student')} 
                                />
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="px-4 py-2 border rounded"
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeBlock; 