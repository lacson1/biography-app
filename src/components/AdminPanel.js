import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, X, Save, User } from 'lucide-react';
import { getAllUsers, updateUserData } from '../firebase';

const AdminPanel = ({ onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async() => {
        setLoading(true);
        try {
            const userList = await getAllUsers();
            setUsers(userList);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEditUser = (user) => {
        setEditingUser({...user });
    };

    const handleSaveUser = async() => {
        if (!editingUser) return;

        try {
            await updateUserData(editingUser.id, {
                name: editingUser.name,
                role: editingUser.role,
                updatedAt: new Date().toISOString()
            });

            setUsers(users.map(user =>
                user.id === editingUser.id ? {...user, ...editingUser } : user
            ));
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async(userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Note: In a real app, you'd need to implement user deletion in Firebase
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleAddUser = async() => {
        if (!newUser.name || !newUser.email) return;

        try {
            // Note: In a real app, you'd need to implement user creation in Firebase
            const userToAdd = {
                id: Date.now().toString(),
                ...newUser,
                createdAt: new Date().toISOString()
            };
            setUsers([...users, userToAdd]);
            setNewUser({ name: '', email: '', role: 'user' });
            setShowAddUser(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    if (loading) {
        return ( <
            div className = "min-h-screen bg-gray-50 flex items-center justify-center" >
            <
            div className = "text-center" >
            <
            div className = "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" > < /div> <
            p className = "text-gray-600" > Loading users... < /p> < /
            div > <
            /div>
        );
    }

    return ( <
        div className = "min-h-screen bg-gray-50" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" > { /* Header */ } <
        div className = "flex items-center justify-between mb-8" >
        <
        div className = "flex items-center" >
        <
        button onClick = { onBack }
        className = "mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" >
        <
        X className = "h-6 w-6" / >
        <
        /button> <
        div className = "flex items-center" >
        <
        Users className = "h-8 w-8 text-blue-600 mr-3" / >
        <
        h1 className = "text-3xl font-bold text-gray-900" > User Management < /h1> < /
        div > <
        /div> <
        button onClick = {
            () => setShowAddUser(true)
        }
        className = "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors" >
        <
        Plus className = "h-5 w-5 mr-2" / >
        Add User <
        /button> < /
        div >

        { /* Search */ } <
        div className = "mb-6" >
        <
        div className = "relative" >
        <
        Search className = "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" / >
        <
        input type = "text"
        placeholder = "Search users..."
        value = { searchTerm }
        onChange = {
            (e) => setSearchTerm(e.target.value)
        }
        className = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /
        >
        <
        /div> < /
        div >

        { /* Users Table */ } <
        div className = "bg-white rounded-lg shadow overflow-hidden" >
        <
        div className = "overflow-x-auto" >
        <
        table className = "min-w-full divide-y divide-gray-200" >
        <
        thead className = "bg-gray-50" >
        <
        tr >
        <
        th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
        User <
        /th> <
        th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
        Email <
        /th> <
        th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
        Role <
        /th> <
        th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
        Created <
        /th> <
        th className = "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" >
        Actions <
        /th> < /
        tr > <
        /thead> <
        tbody className = "bg-white divide-y divide-gray-200" > {
            filteredUsers.map((user) => ( <
                tr key = { user.id }
                className = "hover:bg-gray-50" >
                <
                td className = "px-6 py-4 whitespace-nowrap" > {
                    editingUser && editingUser.id === user.id ? ( <
                        input type = "text"
                        value = { editingUser.name }
                        onChange = {
                            (e) => setEditingUser({...editingUser, name: e.target.value })
                        }
                        className = "border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" /
                        >
                    ) : ( <
                        div className = "flex items-center" >
                        <
                        div className = "h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center" >
                        <
                        User className = "h-5 w-5 text-blue-600" / >
                        <
                        /div> <
                        div className = "ml-4" >
                        <
                        div className = "text-sm font-medium text-gray-900" > { user.name || 'Unnamed User' } <
                        /div> < /
                        div > <
                        /div>
                    )
                } <
                /td> <
                td className = "px-6 py-4 whitespace-nowrap text-sm text-gray-900" > { user.email } <
                /td> <
                td className = "px-6 py-4 whitespace-nowrap" > {
                    editingUser && editingUser.id === user.id ? ( <
                        select value = { editingUser.role }
                        onChange = {
                            (e) => setEditingUser({...editingUser, role: e.target.value })
                        }
                        className = "border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" >
                        <
                        option value = "user" > User < /option> <
                        option value = "admin" > Admin < /option> < /
                        select >
                    ) : ( <
                        span className = { `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.role === 'admin' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }` } > { user.role || 'user' } <
                        /span>
                    )
                } <
                /td> <
                td className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500" > { user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' } <
                /td> <
                td className = "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" > {
                    editingUser && editingUser.id === user.id ? ( <
                        div className = "flex justify-end space-x-2" >
                        <
                        button onClick = { handleSaveUser }
                        className = "text-green-600 hover:text-green-900" >
                        <
                        Save className = "h-5 w-5" / >
                        <
                        /button> <
                        button onClick = {
                            () => setEditingUser(null)
                        }
                        className = "text-gray-600 hover:text-gray-900" >
                        <
                        X className = "h-5 w-5" / >
                        <
                        /button> < /
                        div >
                    ) : ( <
                        div className = "flex justify-end space-x-2" >
                        <
                        button onClick = {
                            () => handleEditUser(user)
                        }
                        className = "text-blue-600 hover:text-blue-900" >
                        <
                        Edit className = "h-5 w-5" / >
                        <
                        /button> <
                        button onClick = {
                            () => handleDeleteUser(user.id)
                        }
                        className = "text-red-600 hover:text-red-900" >
                        <
                        Trash2 className = "h-5 w-5" / >
                        <
                        /button> < /
                        div >
                    )
                } <
                /td> < /
                tr >
            ))
        } <
        /tbody> < /
        table > <
        /div> < /
        div >

        { /* Add User Modal */ } {
            showAddUser && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
                <
                div className = "bg-white rounded-lg p-6 w-full max-w-md" >
                <
                h3 className = "text-lg font-medium text-gray-900 mb-4" > Add New User < /h3> <
                div className = "space-y-4" >
                <
                div >
                <
                label className = "block text-sm font-medium text-gray-700 mb-1" >
                Name <
                /label> <
                input type = "text"
                value = { newUser.name }
                onChange = {
                    (e) => setNewUser({...newUser, name: e.target.value })
                }
                className = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder = "Enter user name" /
                >
                <
                /div> <
                div >
                <
                label className = "block text-sm font-medium text-gray-700 mb-1" >
                Email <
                /label> <
                input type = "email"
                value = { newUser.email }
                onChange = {
                    (e) => setNewUser({...newUser, email: e.target.value })
                }
                className = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder = "Enter user email" /
                >
                <
                /div> <
                div >
                <
                label className = "block text-sm font-medium text-gray-700 mb-1" >
                Role <
                /label> <
                select value = { newUser.role }
                onChange = {
                    (e) => setNewUser({...newUser, role: e.target.value })
                }
                className = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" >
                <
                option value = "user" > User < /option> <
                option value = "admin" > Admin < /option> < /
                select > <
                /div> < /
                div > <
                div className = "flex justify-end space-x-3 mt-6" >
                <
                button onClick = {
                    () => setShowAddUser(false)
                }
                className = "px-4 py-2 text-gray-600 hover:text-gray-800" >
                Cancel <
                /button> <
                button onClick = { handleAddUser }
                className = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" >
                Add User <
                /button> < /
                div > <
                /div> < /
                div >
            )
        } <
        /div> < /
        div >
    );
};

export default AdminPanel;