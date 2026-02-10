'use client';

import { User } from 'firebase/auth';
import { doc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Creates or updates a user profile document in Firestore.
 * This function is designed to be called after any sign-in or sign-up event.
 * Using { merge: true } makes it a safe "upsert" operation.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth User object.
 */
export function createUserProfileDocument(firestore: Firestore, user: User) {
  const userProfileRef = doc(firestore, `users/${user.uid}`);

  const data = {
    id: user.uid,
    email: user.email,
    username: user.displayName || user.email?.split('@')[0],
    // photoURL: user.photoURL, // You can add this if needed
  };

  // Use the non-blocking fire-and-forget update
  setDocumentNonBlocking(userProfileRef, data, { merge: true });
}
