// File: src/App.js
import React, { useState, useEffect } from 'react';
import UserScreen from './components/UserScreen';
import ExpenseScreen from './components/ExpenseScreen';
import SummaryScreen from './components/SummaryScreen';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [screen, setScreen] = useState(0);
  const [trips, setTrips] = useState({});
  const [currentTripId, setCurrentTripId] = useState('');
  const [tripNameInput, setTripNameInput] = useState('');
  const [user, setUser] = useState(null);
  const [globalUsers, setGlobalUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      const q = query(collection(db, 'trips'), where('participants', 'array-contains', user.uid));
      const tripCollection = await getDocs(q);
      const tripData = {};
      tripCollection.forEach(doc => {
        tripData[doc.id] = doc.data();
      });
      setTrips(tripData);
    };
    const fetchGlobalUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userList = usersSnapshot.docs.map(doc => doc.data());
      setGlobalUsers(userList);
    };
    fetchTrips();
    fetchGlobalUsers();

    const urlTripId = window.location.pathname.replace('/', '');
    if (urlTripId) {
      setCurrentTripId(urlTripId);
      setScreen(1);
    }
  }, [user]);

  useEffect(() => {
    if (currentTripId) {
      const unsub = onSnapshot(doc(db, 'trips', currentTripId), (doc) => {
        setTrips((prev) => ({
          ...prev,
          [currentTripId]: doc.data()
        }));
      });
      return () => unsub();
    }
  }, [currentTripId]);

  const createTrip = async () => {
    if (!user) return;
    const name = tripNameInput.trim();
    if (!name) return;
    const id = uuidv4();
    const tripData = {
      name,
      users: [],
      expenses: [],
      owner: user.uid,
      participants: [user.uid],
    };
    await setDoc(doc(db, 'trips', id), tripData);
    setCurrentTripId(id);
    setScreen(1);
    setTripNameInput('');
    window.history.pushState(null, '', `/${id}`);
  };

  const joinTrip = async () => {
    const id = prompt('Enter Trip ID to join (from shared link):');
    if (!id) return;
    const tripRef = doc(db, 'trips', id);
    const snap = await getDoc(tripRef);
    if (snap.exists()) {
      const trip = snap.data();
      if (!trip.participants.includes(user.uid)) {
        await updateDoc(tripRef, {
          participants: [...trip.participants, user.uid],
        });
      }
      setCurrentTripId(id);
      setScreen(1);
      window.history.pushState(null, '', `/${id}`);
    } else {
      alert('Trip not found.');
    }
  };

  const selectTrip = (id) => {
    setCurrentTripId(id);
    setScreen(1);
    window.history.pushState(null, '', `/${id}`);
  };

  const updateTrip = async (updates) => {
    const updated = {
      ...trips[currentTripId],
      ...updates,
    };
    await updateDoc(doc(db, 'trips', currentTripId), updated);
  };

  const renameTrip = async (id, newName) => {
    if (!newName.trim()) return;
    await updateDoc(doc(db, 'trips', id), { name: newName.trim() });
  };

  const deleteTrip = async (id) => {
    await deleteDoc(doc(db, 'trips', id));
    const newTrips = { ...trips };
    delete newTrips[id];
    setTrips(newTrips);
    if (id === currentTripId) {
      setCurrentTripId('');
      setScreen(0);
      window.history.pushState(null, '', '/');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Trip link copied to clipboard!');
    });
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    setTrips({});
    setCurrentTripId('');
    setScreen(0);
    window.history.pushState(null, '', '/');
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Trip Expense Splitter</h1>
        <button onClick={login} className="bg-blue-500 text-white p-3 rounded">
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!currentTripId) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Select or Create Trip</h1>
          <button onClick={logout} className="text-sm text-red-500 underline">Sign Out</button>
        </div>
        <div className="mb-4">
          <input
            placeholder="New Trip Name"
            value={tripNameInput}
            onChange={(e) => setTripNameInput(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={createTrip} className="bg-blue-500 text-white p-2 rounded">
            Create Trip
          </button>
          <button onClick={joinTrip} className="bg-green-500 text-white p-2 rounded ml-2">
            Join Trip
          </button>
        </div>
        <h2 className="text-lg font-semibold mb-2">Your Trips</h2>
        <ul className="space-y-2">
          {Object.entries(trips).map(([id, trip]) => (
            <li key={id} className="flex items-center justify-between">
              <button onClick={() => selectTrip(id)} className="text-blue-600 underline">
                {trip.name}
              </button>
              <div className="flex gap-2 text-sm">
                <button
                  className="text-yellow-600 underline"
                  onClick={() => {
                    const newName = prompt('Enter new name for trip:', trip.name);
                    if (newName) renameTrip(id, newName);
                  }}
                >
                  Rename
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trip?')) {
                      deleteTrip(id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const trip = trips[currentTripId];

  if (!trip) return <div className="p-6">Loading trip data...</div>;

  const tripParticipants = globalUsers.filter(u => trip.participants?.includes(u.uid));

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 items-center">
        <h1 className="text-2xl font-bold">Trip: {trip.name}</h1>
        <button onClick={copyLink} className="text-sm text-blue-600 underline ml-4">
          Copy Shareable Link
        </button>
        <button
          onClick={() => {
            setCurrentTripId('');
            setScreen(0);
            window.history.pushState(null, '', '/');
          }}
          className="ml-auto text-sm text-gray-600 underline"
        >
          Switch Trip
        </button>
        <button onClick={logout} className="text-sm text-red-500 underline ml-4">
          Sign Out
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Participants</h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {tripParticipants.map(u => (
            <li key={u.uid}>{u.name} ({u.email})</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setScreen(1)} className="bg-gray-200 p-2 rounded">Users</button>
        <button onClick={() => setScreen(2)} className="bg-gray-200 p-2 rounded">Expenses</button>
        <button onClick={() => setScreen(3)} className="bg-gray-200 p-2 rounded">Summary</button>
      </div>

      {screen === 1 && (
        <UserScreen
          users={trip.users}
          globalUsers={globalUsers}
          addUser={(u) => updateTrip({ users: [...trip.users, u] })}
          removeUser={(email) => updateTrip({ users: trip.users.filter(u => u.email !== email) })}
        />
      )}

      {screen === 2 && (
        <ExpenseScreen
          users={trip.users}
          expenses={trip.expenses}
          addExpense={(e) => updateTrip({ expenses: [...trip.expenses, e] })}
          updateExpense={(i, e) => {
            const updated = [...trip.expenses];
            updated[i] = e;
            updateTrip({ expenses: updated });
          }}
          removeExpense={(i) => updateTrip({ expenses: trip.expenses.filter((_, idx) => idx !== i) })}
        />
      )}

      {screen === 3 && (
        <SummaryScreen
          users={trip.users}
          expenses={trip.expenses}
        />
      )}
    </div>
  );
};

export default App;
