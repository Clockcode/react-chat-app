import React, { useRef, useState, useEffect } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  // your config
  apiKey: "AIzaSyDQsUQgvM4ohoXRcBeHCbKPE2SlhOYj43E",
  authDomain: "chat-app-global.firebaseapp.com",
  databaseURL: "https://chat-app-global.firebaseio.com",
  projectId: "chat-app-global",
  storageBucket: "chat-app-global.appspot.com",
  messagingSenderId: "756548942959",
  appId: "1:756548942959:web:b727d8addcfb637163a19a",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Developer 💬 Room </h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function refreshPage() {
  window.location.reload(false);
}

function SignIn() {
  const [warningPopUp, setWarningPopUp] = useState(false);
  useEffect(() => {
    console.info(warningPopUp);
  }, [warningPopUp]);

  return (
    <>
      <button
        className="sign-in"
        onClick={() => setWarningPopUp(!warningPopUp)}
      >
        Sign in with Google
      </button>
      {warningPopUp ? warningPopup() : null}
    </>
  );
}

const warningPopup = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <Modal.Dialog className="modal-warning">
      <Modal.Header closeButton>
        <Modal.Title>Warning</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Do not violate the community guidelines or you will be banned for
          life!
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={refreshPage}>
          I am on the naughty list
        </Button>
        <Button variant="success" onClick={signInWithGoogle}>
          I am a good kid
        </Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
