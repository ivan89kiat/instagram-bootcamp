import React from "react";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database } from "./firebase";
import logo from "./logo.png";
import "./App.css";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty messages array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {
      userInput: "",
      date: new Date(),
      messages: [],
    };
  }

  componentDidMount() {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      const info = data.val();
      // Add the subsequent child to local component state, initialising a new array to trigger re-render
      this.setState((state) => ({
        // Store message key so we can use it as a key in our list items when rendering messages
        messages: [
          ...state.messages,
          { key: data.key, content: info.content, date: info.date },
        ],
      }));
    });
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class
  writeData = () => {
    const currDate = new Date().toLocaleString();
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      content: this.state.userInput,
      date: currDate,
    });
  };

  handleChange = (e) => {
    const newMessage = e.target.value;
    this.setState({
      userInput: newMessage,
    });
  };

  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message) => (
      <li key={message.key}>
        <div className="container">
          <div className="chatText">
            {message.content}
            <div className="chatDate">{message.date}</div>
            <br />
          </div>
        </div>
      </li>
    ));
    console.log(this.state.messages);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <form>
            <input
              type="text"
              name="userInput"
              placeholder="Enter your message"
              value={this.state.userInput}
              onChange={this.handleChange}
            />
            <button onClick={this.writeData}>Send</button>
          </form>
          <ol className="panel">{messageListItems}</ol>
        </header>
      </div>
    );
  }
}

export default App;
