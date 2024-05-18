import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from "react-router-dom";

const EditorPage = () => {
    // useRef to hold socket instance and current code
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    // Hooks to get the URL parameters and navigate
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();

    // State to keep track of connected clients
    const [clients, setClients] = useState([]);

    useEffect(() => {
        // Function to initialize the socket connection
        const init = async () => {
            // Initialize socket connection and handle errors
            socketRef.current = await initSocket();
            socketRef.current.on("connect_error", (err) => handleErrors(err));
            socketRef.current.on("connect_failed", (err) => handleErrors(err));

            // Function to handle socket errors
            function handleErrors(e) {
                console.log("socket error", e);
                toast.error("Socket connection failed, try again later.");
                reactNavigator("/");
            }

            // Emit JOIN event with roomId and username
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    // Emit SYNC_CODE event with current code and socketId
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listen for DISCONNECTED event
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });
        };

        // Initialize socket connection on component mount
        init();

        // Cleanup function to disconnect socket and remove event listeners
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    // Function to copy Room ID
    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room ID has been copied to your clipboard");
        } catch (err) {
            toast.error("Could not copy the Room ID");
            console.error(err);
        }
    }

    // Function to Leave Room
    function leaveRoom() {
        reactNavigator("/");
    }

    // If there is no location state (username), navigate back to home page
    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="LogoImage"
                            src="https://codegyan.in/static/images/logo/codegyan-green-w.svg"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    <i className="fa-light fa-link"></i> Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    <i className="fa-light fa-phone-xmark"></i> Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;
