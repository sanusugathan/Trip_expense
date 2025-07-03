// File: src/AppRouter.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import LandingPage from './components/LandingPage';
import UserScreen from './components/UserScreen';
import TripPage from './pages/TripPage';

const AppRouter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalUsers, setGlobalUsers] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setGlobalUsers(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribeUsers();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Trip Expense Splitter</h1>
        <button onClick={login} className="bg-blue-500 text-white p-3 rounded">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} logout={logout} />} />
        <Route
          path="/users"
          element={<UserScreen globalUsers={globalUsers} />}
        />
        <Route
          path="/trips/:tripId"
          element={<TripPage globalUsers={globalUsers} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
