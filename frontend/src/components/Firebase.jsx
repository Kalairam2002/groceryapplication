import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhASEeCLwCr3qFgoYKNCObTQ2SNhS82Eo",
  authDomain: "rdeg-app-authentications.firebaseapp.com",
  projectId: "rdeg-app-authentications",
  storageBucket: "rdeg-app-authentications.appspot.com",
  messagingSenderId: "384229411669",
  appId: "1:384229411669:web:6bb7150f73fc86c3bb7ddc",
  measurementId: "G-FXCK6GV4Y1"
};

const app = initializeApp(firebaseConfig);
// const data = getAuth(app)
// console.log("Firebase initialized", data);

export const auth = getAuth(app);
