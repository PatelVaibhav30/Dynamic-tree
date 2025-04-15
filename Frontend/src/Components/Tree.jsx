import React, { useState, useEffect, useRef } from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Login from './Login';

const Tree = () => {
    const chartRef = useRef(null);
    const [loginState, setLoginState] = useState(false);

    const [data, setData] = useState([
        {
            key: '0',
            label: 'Root',
            type: 'person',
            className: 'p-person',
            expanded: true,
            children: []
        }
    ]);


    const [selectedKey, setSelectedKey] = useState(null);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const username = localStorage.getItem('lastUsedUsername');
        if (!username) {
            return;
        } else {

        }

        fetch(`http://localhost:3001/tree/${username}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((responseData) => {
                if (responseData) {
                    setData([...responseData]);  // Update state with fetched tree data
                } else {
                    console.log('No tree data found for this user');
                }
                setLoginState(true);
            })
            .catch((error) => {
                console.error('Error fetching tree data:', error);
            });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chartRef.current && !chartRef.current.contains(event.target)) {
                setSelectedKey(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAdd = (key) => {
        const newData = [...data];

        const addNodeRecursive = (nodes) => {
            for (let node of nodes) {
                if (node.key === key) {
                    const newChild = {
                        key: `${key}-${node.children.length}`,
                        label: 'New Node',
                        type: 'person',
                        className: 'p-person',
                        expanded: true,
                        children: []
                    };
                    node.children.push(newChild);
                    return;
                }
                if (node.children) addNodeRecursive(node.children);
            }
        };

        addNodeRecursive(newData);
        setData(newData);

        // Save to JSON
        updateUserTree(newData);
    };

    const handleRemove = (key) => {
        const removeNodeRecursive = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].key === key) {
                    nodes.splice(i, 1);
                    return true;
                }
                if (nodes[i].children) {
                    const removed = removeNodeRecursive(nodes[i].children);
                    if (removed) return true;
                }
            }
            return false;
        };

        if (key === '0') {
            alert('Root node cannot be removed.');
            return;
        }

        const newData = [...data];
        const removed = removeNodeRecursive(newData);

        if (removed) {
            setData(newData);
            setSelectedKey(null);
            updateUserTree(newData); // 🔥 Save changes to backend
        }
    };

    const handleEdit = (key, currentLabel) => {
        setEditingKey(key);
        setEditValue(currentLabel);
    };

    const handleSaveEdit = (key) => {
        const updateLabelRecursive = (nodes) => {
            for (let node of nodes) {
                if (node.key === key) {
                    node.label = editValue;
                    return;
                }
                if (node.children) updateLabelRecursive(node.children);
            }
        };

        const newData = [...data];
        updateLabelRecursive(newData);
        setData(newData);
        setEditingKey(null);
        setEditValue('');

        // Save to JSON
        updateUserTree(newData);
    };

    const nodeTemplate = (node) => {
        const isSelected = selectedKey === node.key;
        const isEditing = editingKey === node.key;

        return (
            <div className="text-center p-2 cursor-pointer" onClick={() => setSelectedKey(node.key === selectedKey ? null : node.key)}>
                {isEditing ? (
                    <div className="flex flex-col items-center">
                        <input
                            value={editValue}
                            autoFocus
                            placeholder="Edit label"
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(node.key)}
                            className="border px-2 py-1 text-sm rounded w-24"
                        />
                        <div className='flex gap-2 mt-2'>
                            <button className="mt-1 text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300" onClick={() => handleSaveEdit(node.key)} >
                                ✅ Save
                            </button>
                            <button className="mt-1 text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300" onClick={() => setEditingKey(null)} >
                            ❌
                            </button>

                        </div>
                    </div>
                ) : (
                    <>
                        <div className="font-semibold">{node.label}</div>
                        {isSelected && (
                            <div className="mt-2 flex justify-center gap-2 flex-wrap">
                                <button
                                    className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                                    onClick={() => handleAdd(node.key)}
                                >
                                    ➕ Add
                                </button>
                                <button
                                    className="text-xs px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                                    onClick={() => handleEdit(node.key, node.label)}
                                >
                                    📝 Edit
                                </button>
                                {node.key !== '0' && (
                                    <button
                                        className="text-xs px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                                        onClick={() => handleRemove(node.key)}
                                    >
                                        🗑 Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };


    const updateUserTree = async (updatedData) => {
        const usernameKey = localStorage.getItem("lastUsedUsername");
        if (!usernameKey) return;

        try {
            await fetch('http://localhost:3001/update-user-tree', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameKey, data: updatedData }),
            });
        } catch (err) {
            console.error("Failed to update tree JSON:", err);
        }
    };

    const logout = () => {
        localStorage.removeItem('lastUsedUsername');
        setLoginState(false);
    }

    return (
        <div className="w-full h-screen pt-10 flex flex-col justify-start items-center">
            {loginState && <div className='w-full mr-10 flex flex-col justify-start items-end relative'>
                <button onClick={logout} className='bg-blue-400 text-white px-4 py-2 rounded-md hover:bg-blue-500'>
                    Logout
                </button>
                <span>User: {localStorage.getItem("lastUsedUsername")}</span>
            </div>}

            {!loginState ?
                <Login setData={setData} setLoginState={setLoginState} />
                :
                <>
                    <div className="w-fit" ref={chartRef}>
                        <OrganizationChart
                            value={data}
                            nodeTemplate={nodeTemplate}
                            selectionMode="single"
                            className="p-organizationchart"
                        />
                    </div>
                </>
            }
        </div>
    );
};

export default Tree;
