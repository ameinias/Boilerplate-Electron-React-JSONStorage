import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from "react-bootstrap/InputGroup";
import {saveDataInStorage} from "../renderer.js";
const { categories } = require("../../utils/constants.js")

const defaultFormValue = {
  amount: '',
  description: '',
  category: 'Athletics'
}

const NewItem = () => {
  const [show, toggleShow] = useState(false);
  const [formValues, setFormValue] = useState(defaultFormValue);
  const [date, setDate] = useState(new Date());

  // Manage state and input field
const handleChange = (e) => {
  const updatedFormValues = {
    amount: formValues.amount,
    description: formValues.description,
    category: formValues.category,
    [e.target.name]: e.target.value
  };
  setFormValue(updatedFormValues);
}

  // Send the input to main
  const addExpense = (e, expenseToAdd) => {
    e.preventDefault()
    saveDataInStorage(expenseToAdd)
    setFormValue(defaultFormValue)
    toggleShow()
  }

  return (
    show ? (
      <div style={{display: "flex", flexDirection: "column", alignItems: "stretch"}}>
        <h1>Single Item</h1>
        <Button variant="outline-primary" style={{marginBottom: "15px"}} onClick={() => toggleShow(!show)}>Collapse</Button>
        <Form onSubmit={(e) => addExpense(e, {
  amount: formValues.amount,
  description: formValues.description,
  category: formValues.category,
  date: date
})}>
          <InputGroup className="mb-2">
            <InputGroup.Prepend>
              <InputGroup.Text>$</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control pattern="[0-9, '.']*" type="text" name="amount" onChange={handleChange} value={formValues.amount} placeholder="Enter Amount" />
          </InputGroup>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" name="description" onChange={handleChange} value={formValues.description} placeholder="Enter Description" />
          </Form.Group>
          <Form.Group controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control as="select" name="category" onChange={handleChange} value={formValues.category} placeholder="Category">
              {categories.map((c, i) => (
                <option key={i}>{c}</option>
                ))}
            </Form.Control>
          </Form.Group>
          <Button variant="outline-primary" type="submit" style={{marginTop: "10px"}}>Submit</Button>
        </Form>
      </div>
    ) : (
      <Button variant="outline-primary" onClick={() => toggleShow(!show)}>New Expense</Button>
    )
  )
}

export default NewItem;