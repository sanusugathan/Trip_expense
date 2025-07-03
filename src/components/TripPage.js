// src/pages/TripPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

import ExpenseScreen from '../components/ExpenseScreen';
import SummaryScreen from '../components/SummaryScreen';
import UserScreen from '../components/UserScreen';

// Initialize Firestore explicitly using the modular API
const db = getFirestore(app);

const TripPage = ({ globalUsers }) => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [screen, setScreen] = useState(1);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'trips', tripId), (snapshot) => {
      if (snapshot.exists()) {
        setTrip({ id: snapshot.id, ...snapshot.data() });
      }
    });

    return () => unsubscribe();
  }, [tripId]);

  const updateTrip = async (updates) => {
    if (!trip) return;
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
          addUser={(user) => updateTrip({ users: [...trip.users, user] })}
          removeUser={(email) =>
            updateTrip({ users: trip.users.filter((u) => u.email !== email) })
          }
        />
      )}

      {screen === 2 && (
        <ExpenseScreen
          users={trip.users}
          expenses={trip.expenses}
          addExpense={(expense) => updateTrip({ expenses: [...trip.expenses, expense] })}
          updateExpense={(index, updatedExpense) => {
            const updatedExpenses = [...trip.expenses];
            updatedExpenses[index] = updatedExpense;
            updateTrip({ expenses: updatedExpenses });
          }}
          removeExpense={(index) =>
            updateTrip({ expenses: trip.expenses.filter((_, i) => i !== index) })
          }
        />
      )}

      {screen === 3 && (
        <SummaryScreen users={trip.users} expenses={trip.expenses} />
      )}
    </div>
  );
};

export default TripPage;
