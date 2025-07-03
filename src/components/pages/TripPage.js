// File: src/pages/TripPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseScreen from '../components/ExpenseScreen';
import SummaryScreen from '../components/SummaryScreen';
import UserScreen from '../components/UserScreen';

const TripPage = ({ globalUsers }) => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [screen, setScreen] = useState(1);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'trips', tripId), (snap) => {
      if (snap.exists()) setTrip({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [tripId]);

  const updateTrip = async (updates) => {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      ...trip,
      ...updates,
    });
  };

  if (!trip) return <div className="p-6">Loading trip...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">Trip: {trip.name}</h1>
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
          removeUser={(email) =>
            updateTrip({ users: trip.users.filter((u) => u.email !== email) })
          }
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
          removeExpense={(i) =>
            updateTrip({ expenses: trip.expenses.filter((_, idx) => idx !== i) })
          }
        />
      )}

      {screen === 3 && <SummaryScreen users={trip.users} expenses={trip.expenses} />}
    </div>
  );
};

export default TripPage;
