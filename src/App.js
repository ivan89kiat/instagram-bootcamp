import React from "react";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database } from "./firebase";
import logo from "./logo.png";
import "./App.css";
import { storage } from "./firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { Card, Button } from "react-bootstrap";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";
const IMAGES_FOLDER_NAME = "images";
class App extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty messages array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {
      fileInputValue: "",
      fileInputFile: null,
      userInput: "",
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
          {
            key: data.key,
            content: info.content,
            date: info.date,
            url: info.url,
          },
        ],
      }));
    });
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class
  writeData = (url) => {
    const currDate = new Date().toLocaleString();
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      content: this.state.userInput,
      date: currDate,
      url: url,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const fileRef = storageRef(
      storage,
      `${IMAGES_FOLDER_NAME}/${this.state.fileInputFile.name}`
    );
    uploadBytes(fileRef, this.state.fileInputFile).then(() =>
      getDownloadURL(fileRef).then((url) => this.writeData(url))
    );
    this.setState({
      fileInputValue: "",
      fileInputFile: null,
    });
  };

  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message) => (
      <Card key={message.key}>
        <Card.Img className="image" variant="top" src={message.url} />
        <Card.Body>
          <Card.Text>{message.content}</Card.Text>
          <Card.Text className="chatDate">{message.date}</Card.Text>
        </Card.Body>
      </Card>
    ));

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="userInput"
              placeholder="Enter your message"
              value={this.state.userInput}
              onChange={(e) => {
                this.setState({ userInput: e.target.value });
              }}
            />
            <input
              type="file"
              name="fileInputValue"
              value={this.state.fileInputValue}
              onChange={(e) =>
                this.setState({
                  fileInputFile: e.target.files[0],
                  fileInputValue: e.target.value,
                })
              }
            />
            <input type="submit" value="submit" name="submit" />
            {/* <button onClick={this.writeData}>Send</button> */}
          </form>
          <ol className="panel">{messageListItems}</ol>
        </header>
      </div>
    );
  }
}

export default App;
