
// File: src/components/UserScreen.js
import React, { useState } from 'react';

const UserScreen = ({ users, addUser, removeUser }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!name || !email) return;
    addUser({ name, mobile, email });
    setName('');
    setMobile('');
    setEmail('');
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input className="border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <input className="border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleAdd} className="bg-blue-500 text-white p-2 rounded">Add</button>
      </div>

      <ul>
        {users.map((u) => (
          <li key={u.email} className="flex justify-between items-center border-b py-2">
            <span>{u.name} ({u.email})</span>
            <button onClick={() => removeUser(u.email)} className="text-red-600">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserScreen;
