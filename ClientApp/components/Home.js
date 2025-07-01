import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from "react-bootstrap/InputGroup";
import {loadSavedData, saveDataInStorage} from "../renderer.js";
import List from "./List";
import Search from "./Search";
const { ipcRenderer } = require("electron");
const { HANDLE_FETCH_DATA, HANDLE_SAVE_DATA, HANDLE_REMOVE_DATA, HANDLE_EDIT_DATA } = require("../../utils/constants")

const Home = () => {
  const [val, setVal] = useState("");
  const [itemsToTrack, setItems] = useState([]);

  // Grab the user's saved itemsToTrack after the app loads
  useEffect(() => {
    loadSavedData();
  }, []);

  // Listener functions that receive messages from main
  useEffect(() => {
    ipcRenderer.on(HANDLE_SAVE_DATA, handleNewItem);
    // If we omit the next step, we will cause a memory leak and & exceed max listeners
    return () => {
      ipcRenderer.removeListener(HANDLE_SAVE_DATA, handleNewItem);
    }
  });
  useEffect(() => {
    ipcRenderer.on(HANDLE_FETCH_DATA, handleReceiveData);
    return () => {
      ipcRenderer.removeListener(HANDLE_FETCH_DATA, handleReceiveData);
    }
  });
  useEffect(() => {
    ipcRenderer.on(HANDLE_REMOVE_DATA, handleReceiveData);
    return () => {
      ipcRenderer.removeListener(HANDLE_REMOVE_DATA, handleReceiveData);
    }
  });

  // Receives itemsToTrack from main and sets the state
  const handleReceiveData = (event, data) => {
    setItems(Array.from(data.message));
  };

  // Receives a new item back from main
  const handleNewItem = (event, data) => {
    setItems(itemsToTrack.concat(data.message));
  }

  // Manage state and input field
  const handleChange = (e) => {
    setVal(e.target.value)
  }

  // Send the input to main
  const addItem = (input) => {
    saveDataInStorage(input)
    setVal("")
  }

    const handleKeypress = (event) => {
      //it triggers by pressing the enter key
    if (event.key === 'Enter') {
      addItem(val)
      console.log("attempt send")
    } 
  };



  return (
    <div className="sidebar">
      <Search itemsToTrack={itemsToTrack}/>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <Button variant="outline-primary" onClick={() => loadSavedData()}>Refresh</Button>
        </InputGroup.Prepend>
        <input type="text" onChange={handleChange} value={val} onKeyDown={handleKeypress} />
        <Button variant="outline-primary"  onClick={() => addItem(val)}>New Item</Button>
      </InputGroup>
      {/* <Link to="/BlankComponent">to BlankComponent</Link> */}
      {itemsToTrack.length ? (
        <List itemsToTrack={itemsToTrack} />
      ) : (
        <p>Add an item to get started</p>
      )}
    </div>
  )
}

export default Home
