import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { deleteUser } from "../services/UserServices";
import { ToastContainer, toast } from "react-toastify";

const ModalConfirm = (props) => {
  const {
    show,
    handleClose,
    dataDeleteUser,
    handleUpdateTableDeleteFromModal,
  } = props;

  const confirmDelete = async () => {
    let res = await deleteUser(dataDeleteUser.id);
    console.log("res: ", res);
    if (res && +res.statusCode === 204) {
      toast.success("Delete user is success");
      handleClose();
      handleUpdateTableDeleteFromModal(dataDeleteUser);
    } else {
      toast.error("error delete user");
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete A User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-add-new">
            This action can't be undone! Do you want to delete this user?
            <br />
            <b>email = {dataDeleteUser.email} ?</b>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              confirmDelete();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalConfirm;
