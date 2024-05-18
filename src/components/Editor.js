import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    // useRef to hold the CodeMirror editor instance
    const editorRef = useRef(null);
    useEffect(() => {
        // Initialize CodeMirror editor
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            // Listen for changes in the editor
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    // Emit CODE_CHANGE event to the server if the change is not from setting value
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }

        // Call the init function to initialize the editor
        init();
    }, []);

    useEffect(() => {
        // Listen for CODE_CHANGE events from the server
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    // Set the code in the editor if it's not null
                    editorRef.current.setValue(code);
                }
            });
        }

        // Cleanup function to remove the CODE_CHANGE listener
        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    // Render the textarea element that will be replaced by CodeMirror
    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
