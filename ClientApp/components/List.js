import React from 'react';
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button";
import {removeDataFromStorage, editDataInStorage} from "../renderer.js";

const List = ({itemsToTrack}) => {
  
  const removeItem = (item) => {
    removeDataFromStorage(item)
  }

  // Not sure how to handle this on UI, doesn't work yet
  const editItem = (item) => {
    editDataInStorage(item)
  }


  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
        </tr>
      </thead>
      <tbody>
        {itemsToTrack.map((item, i) => {
          return (
            <tr key={i+1}>
              <td>{i+1}</td>
              <td>{item}</td>
              <td>
                <Button
                  variant="outline-danger"
                  onClick={() => removeItem(item)}
                >Remove</Button><Button
                  variant="outline-danger"
                  onClick={() => editDataInStorage(item)}
                >Edit</Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default List;
