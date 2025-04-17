import React, { useState } from 'react'

const Login = ({ setLoginState, setData }) => {
    const [username, setUsername] = useState('');

    const UserActionsClick = (action) => {
        const trimmedUsername = username.trim().toLowerCase();
        localStorage.setItem("lastUsedUsername", trimmedUsername);
        if (action === "ADD") {
            AddDataToJSON(trimmedUsername);
        }
    };

    const AddDataToJSON = async (username) => {
        const usernameKey = username.trim().toLowerCase();
        try {
            await fetch('https://dynamic-tree.onrender.com/add-user-tree', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameKey }),
            });
            setLoginState(true);

            // Then fetch the user's tree dynamically from your backend
            const res = await fetch(`https://dynamic-tree.onrender.com/tree/${usernameKey}`);
            const responseData = await res.json();

            if (responseData) {
                setData([...responseData]);
                setLoginState(true);
            } else {
                console.log("No tree data found for this user.");
            }
        } catch (err) {
            console.error('Failed to add user tree:', err);
        }
    };


    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className='w-xl min-h-40 flex flex-col justify-start items-center border-2 border-black rounded-lg shadow-lg'>
                <span className='text-blue-400 font-semibold mt-2'>Username</span>
                <input
                    placeholder='Enter your username'
                    type="text"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            UserActionsClick("ADD");
                        }
                    }}
                    className="border px-2 py-1 text-sm rounded w-48 mt-2 mb-2"
                />
            </div>

        </div>
    )
}

export default Login