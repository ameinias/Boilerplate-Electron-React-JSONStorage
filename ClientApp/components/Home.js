import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import {loadSavedData} from "../renderer.js";
import List from "./List";
import CategoryDropdown from "./CategoryDropdown.js";
import NewItem from "./NewItem";
import Form from 'react-bootstrap/Form';
// import getMonth from 'date-fns/getMonth';
// import getYear from 'date-fns/getYear';
const { ipcRenderer } = require("electron");
const { HANDLE_FETCH_DATA, HANDLE_SAVE_DATA } = require('../../utils/constants.js')
const { categories } = require("../../utils/constants.js")



const Home = () => {
  //const [pieView, changeView] = useState(true)
  //const [expenses, setExpenses] = useState([]);
    const [val, setVal] = useState("");
    const [dbItems, setItems] = useState([]);

  // Keep a separate reference to all the expenses that match the current filter
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Keep track of filters / single category here -- it will be used by both ExpensesList and BudgetProgress comps
  const [categoryFilter, setCategoryFilter] = useState('All')



  // Grab the user's saved expenses after the app loads
  useEffect(() => {
    loadSavedData();
  }, []);

  // Update expenses
  useEffect(() => {
    const filtered = dbItems.filter(exp => {
      // const expDate = new Date(exp.date)
      // const year = getYear(expDate);
      // const month = getMonth(expDate);
      return (categoryFilter === "All" || categoryFilter === exp.category)
        // && getYear(expDate) === calYear
        // && getMonth(expDate) === calMonth
    })
    // console.log("NEW FILTERED EXPENSES:", filtered)
    setFilteredExpenses(filtered)
    // Listen for new Expenses, change in month or filter
  }, [categoryFilter,  dbItems]);


  // Listener functions that receive messages from main
  useEffect(() => {
    ipcRenderer.on(HANDLE_SAVE_DATA, handleNewExpense);
    // If we omit the next step, we will cause a memory leak and & exceed max listeners
    return () => {
      ipcRenderer.removeListener(HANDLE_SAVE_DATA, handleNewExpense);
    }
  });
  useEffect(() => {
    ipcRenderer.on(HANDLE_FETCH_DATA, handleReceiveExpensesFromMain);
    return () => {
      ipcRenderer.removeListener(HANDLE_FETCH_DATA, handleReceiveExpensesFromMain);
    }
  });

  // Receives all user expenses from main
  const handleReceiveExpensesFromMain = (event, data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      console.log("renderer received data from main:", data.message);
      setItems([...data.message]);
    }
  };

  // Receives a new expense from main
  const handleNewExpense = (event, data) => {
    if (data.error) {
      console.log(data.error)
    } else {
      console.log("renderer received data from main:", data.message)
      setItems([...dbItems, data.message])
    }
  }

  // // Toggle between Pie and List views
  // const handleChangeView = () => {
  //   if (!pieView) {
  //     // Going into Pie View we want to view all Categories
  //     setCategoryFilter("All")
  //   }
  //   changeView(!pieView)
  // }

  // Send the input to main
  const addItem = (input) => {
    saveDataInStorage(input)
    setVal("")
  }


  return (
    <div>
      fsfsdkjsklj
      <NewItem />
      {dbItems.length ? (
        <List dbItems={dbItems} />
      ) : (
        <p>Add an item fsfd to get started</p>
      )}
    </div>
  )
}

export default Home