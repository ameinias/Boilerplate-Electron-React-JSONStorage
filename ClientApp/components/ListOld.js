import React from 'react';
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button";
import {removeDataFromStorage} from "../renderer.js"

const ListOld = ({dbItems}) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
        </tr>
      </thead>
      <tbody>
        {dbItems.map((item, i) => {
          return (
            <tr key={i+1}>
              <td>{i+1}</td>
              <td>{item}</td>
              <td>
                <Button
                  variant="outline-danger"
                  onClick={() => removeDataFromStorage(item)}
                >Remove</Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default ListOld;
