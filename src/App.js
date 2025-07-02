// File: src/App.js
import React, { useState, useEffect } from 'react';
import UserScreen from './components/UserScreen';
import ExpenseScreen from './components/ExpenseScreen';
import SummaryScreen from './components/SummaryScreen';

const LOCAL_STORAGE_KEY = 'trip-expense-tracker';

const App = () => {
  const [screen, setScreen] = useState(0); // 0: Trip selector, 1: Users, 2: Expenses, 3: Summary
  const [trips, setTrips] = useState({});
  const [currentTrip, setCurrentTrip] = useState('');
  const [tripNameInput, setTripNameInput] = useState('');

  // Load trips from localStorage
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      setTrips(JSON.parse(data));
    }
  }, []);

  // Save trips to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const createTrip = () => {
    const name = tripNameInput.trim();
    if (!name || trips[name]) return;
    setTrips({ ...trips, [name]: { users: [], expenses: [] } });
    setCurrentTrip(name);
    setScreen(1);
    setTripNameInput('');
  };

  const selectTrip = (name) => {
    setCurrentTrip(name);
    setScreen(1);
  };

  const updateTrip = (updates) => {
    setTrips({
      ...trips,
      [currentTrip]: {
        ...trips[currentTrip],
        ...updates,
      },
    });
  };

  if (!currentTrip) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Select or Create Trip</h1>
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
        </div>

        <h2 className="text-lg font-semibold mb-2">Existing Trips</h2>
        <ul className="space-y-2">
          {Object.keys(trips).map((name) => (
            <li key={name}>
              <button onClick={() => selectTrip(name)} className="text-blue-600 underline">
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const trip = trips[currentTrip];

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 items-center">
        <h1 className="text-2xl font-bold">Trip: {currentTrip}</h1>
        <button onClick={() => { setCurrentTrip(''); setScreen(0); }} className="ml-auto text-sm text-gray-600 underline">
          Switch Trip
        </button>
      </div>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setScreen(1)} className="bg-gray-200 p-2 rounded">Users</button>
        <button onClick={() => setScreen(2)} className="bg-gray-200 p-2 rounded">Expenses</button>
        <button onClick={() => setScreen(3)} className="bg-gray-200 p-2 rounded">Summary</button>
      </div>

      {screen === 1 && (
        <UserScreen
          users={trip.users}
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
