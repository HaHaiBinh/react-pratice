import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { fetchAllUser } from "../services/UserServices";
import ReactPaginate from "react-paginate";
import ModalAddNew from "./ModalAddNew";
import ModalEditUser from "./ModalEditUser";
import ModalConfirm from "./ModalConfirm";
import _, { debounce } from "lodash";
import { CSVLink } from "react-csv";
import "./TableUser.scss";
import { toast } from "react-toastify";
import Papa from "papaparse";

const TableUsers = (props) => {
  // modalAddNew
  const [isShowModalAddNew, setIsShowModalAddNew] = useState(false);

  //   modalEditUser
  const [isShowModalEditUser, setIsShowModalEditUser] = useState(false);
  const [dataEditUser, setDataEditUser] = useState({});

  //   modalConfirmDelete
  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [dataDeleteUser, setDataDeleteUser] = useState({});

  // tableUsers
  const [listUsers, setListUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  //   sortBy : asc (tăng dần); desc (giảm dần)
  const [sortBy, setSortBy] = useState("asc");
  const [sortField, setSortField] = useState("id");

  //   search
  const [keyword, setKeyWord] = useState("");

  //   export
  const [dataExport, setDataExport] = useState([]);

  const handleClose = () => {
    setIsShowModalAddNew(false);
    setIsShowModalEditUser(false);
    setIsShowModalDelete(false);
  };

  //   cập nhật user(add-new) lên trên table: viết trên hàm cha
  const handleUpdateTable = (user) => {
    setListUsers([user, ...listUsers]); // đẩy user mới add lên đầu list users
  };

  //   cập nhật user(edit) lên trên table: viết trên hàm cha
  const handleUpdateTableEditFromModal = (user) => {
    let cloneListUser = _.cloneDeep(listUsers);
    // dùng lodash sẽ trỏ tới 2 vùng nhớ khác, còn dùng ...listUser sẽ chỉ trỏ tới 1 vùng nhớ
    let index = listUsers.findIndex((item) => item.id === user.id);
    cloneListUser[index].first_name = user.first_name;
    setListUsers(cloneListUser);
  };

  //   cập nhật user(delete) lên trên table: viết trên hàm cha
  const handleUpdateTableDeleteFromModal = (user) => {
    let cloneListUser = _.cloneDeep(listUsers);
    cloneListUser = cloneListUser.filter((item) => item.id !== user.id);
    setListUsers(cloneListUser);
  };

  const handleDeleteUser = (user) => {
    setIsShowModalDelete(true);
    setDataDeleteUser(user);
  };

  //   sortBy : asc (tăng dần); desc (giảm dần)
  const handleSort = (sortBy, sortField) => {
    setSortBy(sortBy);
    setSortField(sortField);
    let cloneListUser = _.cloneDeep(listUsers);
    cloneListUser = _.orderBy(cloneListUser, [sortField], [sortBy]);
    setListUsers(cloneListUser);
  };

  // search: dùng debounce (lodash) xét timeout để sau khoảng time mới call api -> tránh gọi api quá nhiều
  const handleSearch = debounce((event) => {
    let term = event.target.value;
    console.log("term: ", term);
    if (term) {
      let cloneListUser = _.cloneDeep(listUsers);
      cloneListUser = cloneListUser.filter((item) => item.email.includes(term));
      setListUsers(cloneListUser);
    } else {
      getUsers(1);
    }
  }, 1000);

  //  data example mẫu : export csv
  //  data = [
  //   ["firstname", "lastname", "email"],  -> headers
  //   ["Ahmed", "Tomi", "ah@smthing.co.com"],     // body
  //   ["Raed", "Labes", "rl@smthing.co.com"],     // body
  //   ["Yezzi", "Min l3b", "ymin@cocococo.com"]   // body
  // ];

  const getExportUsers = (event, done) => {
    let result = [];
    if (listUsers && listUsers.length > 0) {
      result.push(["Id", "Email", "First Name", "Last Name"]); // header
      listUsers.map((item, index) => {
        // body
        let arr = [];
        arr[0] = item.id;
        arr[1] = item.email;
        arr[2] = item.first_name;
        arr[3] = item.last_name;
        result.push(arr); // header + body
      });

      setDataExport(result); // set(data)
      done();
    }
  };

  //   import
  const handleImportCSV = (event) => {
    if (event.target && event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (file.type !== "text/csv") {
        toast.error("Only csv file can be imported ");
        return;
      }
      // Parse local CSV file
      Papa.parse(file, {
        complete: function (results) {
          let rawCSV = results.data;
          if (rawCSV.length > 0) {
            if (rawCSV[0] && rawCSV[0].length === 3) {
              if (
                rawCSV[0][0] !== "email" ||
                rawCSV[0][1] !== "first_name" ||
                rawCSV[0][2] !== "last_name"
              ) {
                toast.error("Wrong format Header CSV file");
              } else {
                let result = [];
                rawCSV.map((item, index) => {
                  if (index > 0 && item.length === 3) {
                    let obj = {};
                    obj.email = item[0];
                    obj.first_name = item[1];
                    obj.last_name = item[2];
                    result.push(obj);
                  }
                });
                setListUsers(result);
              }
            } else {
              toast.error("Wrong format CSV file");
            }
          } else {
            toast.error("Not found data on CSV file!");
          }
        },
      });
    }
  };

  useEffect(() => {
    //   call apis
    getUsers(1);
  }, []);

  const getUsers = async (page) => {
    let res = await fetchAllUser(page);
    // console.log("res: ", res);
    if (res && res.data) {
      setTotalUsers(res.total);
      setListUsers(res.data);
      setTotalPages(res.total_pages);
    }
  };

  const handlePageClick = (event) => {
    // console.log("event: ", event);
    getUsers(+event.selected + 1); //+ : convert từ string qua number
  };

  const handleEditUser = (user) => {
    // console.log(user);
    setDataEditUser(user);
    setIsShowModalEditUser(true);
  };

  return (
    <>
      <div className="my-3 add-new">
        <span>
          <b>List Users</b>
        </span>
        <div className="group-btn">
          {/* dùng label và input kiểu này để k ra import file như bình thường (xấu) 
              nhấn vào label : như là nhấn 1 cách gián tiếp và ô input
          */}
          <label htmlFor="import" className="btn btn-warning">
            <i className="fa-solid fa-file-import"></i> Import
          </label>
          <input
            onChange={(event) => {
              handleImportCSV(event); // tạo event để đọc đc file csv
            }}
            id="import"
            type="file"
            hidden
          />

          <CSVLink
            filename={"my-file.csv"}
            className="btn btn-primary"
            data={dataExport} // chạy xong asyncOnClick và getExportUsers thì dataExport mới là data để export
            asyncOnClick={true}
            onClick={getExportUsers} // getExportUsers : tham chiếu
          >
            <i className="fa-solid fa-download"></i> Export
          </CSVLink>
          <button
            className="btn btn-success"
            onClick={() => {
              setIsShowModalAddNew(true);
            }}
          >
            <i className="fa-solid fa-circle-plus"></i> Add new
          </button>
        </div>
      </div>
      <div className="col-4 my-3">
        <input
          className="form-control"
          placeholder="Search user by email ..... "
          onChange={(event) => {
            handleSearch(event);
          }}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <div className="sort-header">
                <span>ID</span>
                <span>
                  <i
                    onClick={() => {
                      handleSort("desc", "id");
                    }}
                    className="fa-solid fa-arrow-down"
                  ></i>
                  <i
                    onClick={() => {
                      handleSort("asc", "id");
                    }}
                    className="fa-solid fa-arrow-up"
                  ></i>
                </span>
              </div>
            </th>
            <th>Email</th>
            <th>
              <div className="sort-header">
                <span>First Name</span>
                <span>
                  <i
                    onClick={() => {
                      handleSort("desc", "first_name");
                    }}
                    className="fa-solid fa-arrow-down"
                  ></i>
                  <i
                    onClick={() => {
                      handleSort("asc", "first_name");
                    }}
                    className="fa-solid fa-arrow-up"
                  ></i>
                </span>
              </div>
            </th>
            <th>Last Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {listUsers &&
            listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <tr key={`user - ${index}`}>
                  <td>{item.id}</td>
                  <td>{item.email}</td>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>
                    <button
                      className="btn btn-warning mx-3"
                      onClick={() => {
                        handleEditUser(item);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleDeleteUser(item);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      <ReactPaginate
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={totalPages}
        previousLabel="< previous"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
      />
      <ModalAddNew
        show={isShowModalAddNew}
        handleClose={handleClose}
        handleUpdateTable={handleUpdateTable}
      />

      <ModalEditUser
        show={isShowModalEditUser}
        handleClose={handleClose}
        dataEditUser={dataEditUser}
        handleUpdateTableEditFromModal={handleUpdateTableEditFromModal}
      />

      <ModalConfirm
        show={isShowModalDelete}
        handleClose={handleClose}
        dataDeleteUser={dataDeleteUser}
        handleUpdateTableDeleteFromModal={handleUpdateTableDeleteFromModal}
      />
    </>
  );
};

export default TableUsers;
