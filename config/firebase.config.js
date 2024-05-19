import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAq7GUrBRo3gu9LawJMznLBsgoqdWzAKto",
  authDomain: "chatapp-95fd9.firebaseapp.com",
  projectId: "chatapp-95fd9",
  storageBucket: "chatapp-95fd9.appspot.com",
  messagingSenderId: "986485991552",
  appId: "1:986485991552:web:466828578abac8f8879e65",
};

const app = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig);

const firebaseAuth = getAuth(app);
// const firebaseAuth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

const firestoreDB = getFirestore(app);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { app, firebaseAuth, firestoreDB, firebase };
