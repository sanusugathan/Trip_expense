// File: src/components/UserScreen.js
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserScreen = ({ users, globalUsers, addUser, removeUser }) => {
  const [selectedEmail, setSelectedEmail] = useState('');

  const availableUsers = globalUsers.filter(
    (u) => !users.some((existing) => existing.email === u.email)
  );

  const handleAdd = async () => {
    const userToAdd = globalUsers.find((u) => u.email === selectedEmail);
    if (userToAdd) {
      addUser(userToAdd);
      try {
        await setDoc(doc(db, 'users', userToAdd.uid), userToAdd, { merge: true });
      } catch (error) {
        console.error('Error adding user to global list:', error);
      }
      setSelectedEmail('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>

      <div className="mb-4 flex gap-2">
        <select
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select a user to add</option>
          {availableUsers.map((u) => (
            <option key={u.email} value={u.email}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selectedEmail}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.email} className="flex justify-between items-center">
            <span>{u.name} ({u.email})</span>
            <button
              onClick={() => removeUser(u.email)}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserScreen;
