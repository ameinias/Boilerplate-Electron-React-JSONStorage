import React from 'react';
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button";
import {removeDataFromStorage} from "../renderer.js"

const List = ({dbItems = []}) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
        </tr>
      </thead>
      <tbody>
        {dbItems.map((item) => {
          return (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.category}</td>
              <td>
                {/* future edit function */}
                {/* <Button variant="outline-warning" onClick={() => editExpense(item)}>Edit</Button>{' '} */}
                <Button variant="outline-danger" onClick={() => removeExpense(item.id)}>Remove</Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default List;
