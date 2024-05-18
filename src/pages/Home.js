import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
    // useNavigate hook to programmatically navigate to different routes
    const navigate = useNavigate();

    // useState hook to manage the state of roomId and username
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    
    // Function to create a new room
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success("Created a new room");
    };

    // Function to join a room
    const joinRoom = () => {
        // Check if roomId or username is empty
        if (!roomId || !username) {
            toast.error("ROOM ID & username is required");
            return; // Exit the function
        }

        // Redirect to the editor page with roomId and username as state
        navigate(`/editor/${roomId}`, {
            state: {
            username,
            },
        });
    };

    // Handle 'Enter' key press to join the room
    const handleInputEnter = (e) => {
        if (e.code === "Enter") {
            joinRoom();
        }
    };

    return (
        <div className="login-bg">
            <div className="homePageWrapper">
            <div className="formWrapper">
                <div className="fs-2 text-center mt-1">
                <img
                    className="Loginlogo"
                    src="https://codegyan.in/static/images/logo/codegyan-green.svg"
                    alt="logo"
                />
                </div>
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                <input
                    type="text"
                    className="inputBox"
                    placeholder="ROOM ID"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <input
                    type="text"
                    className="inputBox"
                    placeholder="USERNAME"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    onKeyUp={handleInputEnter}
                />
                <button className="btn joinBtn" onClick={joinRoom}>
                    <i className="fal fa-arrow-right-to-bracket"></i> &nbsp; Join
                </button>
                <span className="createInfo">
                    If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="" className="createNewBtn">
                    new room
                    </a>
                </span>
                </div>
            </div>
            <footer>
                <h4>Built with 💛 by &nbsp;<a href="https://github.com/prathmeshyelne">Codegyan</a></h4>
            </footer>
            </div>
        </div>
    );
};

export default Home;
