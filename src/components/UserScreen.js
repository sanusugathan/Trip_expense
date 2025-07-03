// src/components/UserScreen.js

import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

const UserScreen = ({
  users = [],
  globalUsers = [],
  addUser = () => {},
  removeUser = () => {}
}) => {
  const [selectedEmail, setSelectedEmail] = useState('');

  // Exclude already-added users from global options
  const availableUsers = globalUsers.filter(
    (user) => !users.some((existing) => existing.email === user.email)
  );

  const handleAdd = async () => {
    const userToAdd = globalUsers.find((u) => u.email === selectedEmail);
    if (!userToAdd) return;

    addUser(userToAdd);
    setSelectedEmail('');

    try {
      const userRef = doc(db, 'users', userToAdd.uid);
      await setDoc(userRef, userToAdd, { merge: true });
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
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
          {availableUsers.map((user) => (
            <option key={user.email} value={user.email}>
              {user.name} ({user.email})
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
        {users.map((user) => (
          <li key={user.email} className="flex justify-between items-center">
            <span>{user.name} ({user.email})</span>
            <button
              onClick={() => removeUser(user.email)}
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
