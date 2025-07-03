// File: src/components/LandingPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from 'firebase';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const LandingPage = ({ user, logout }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trips'), (snapshot) => {
      setTrips(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const createTrip = async () => {
    const docRef = await addDoc(collection(db, 'trips'), {
      name: `Trip ${new Date().toLocaleDateString()}`,
      users: [
        {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
        },
      ],
      expenses: [],
      createdAt: serverTimestamp(),
    });
    navigate(`/trips/${docRef.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
        <button onClick={logout} className="text-red-500 underline text-sm">
          Sign Out
        </button>
      </div>

      <div className="grid gap-4 mb-6">
        <button
          onClick={createTrip}
          className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600"
        >
          + Create New Trip
        </button>
        <button
          onClick={() => navigate('/users')}
          className="bg-green-500 text-white p-3 rounded shadow hover:bg-green-600"
        >
          Manage Global Users
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Your Trips</h2>
      <ul className="space-y-2">
        {trips.map((trip) => (
          <li key={trip.id}>
            <button
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="text-blue-600 underline"
            >
              {trip.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LandingPage;
