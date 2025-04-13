import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import {
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownItem,
  Badge
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  UserAvatar,
  PaginationComponent,
  Button,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PreviewAltCard,
} from "../../../../components/Component";
import { filterStatus } from "./CustomerData";
import { findUpper } from "../../../../utils/Utils";
import { Link } from "react-router-dom";
import { CustomerContext } from "./CustomerContext";
import moment from 'moment'; // تأكد من تثبيت moment.js

const CustomerList = () => {
  const { contextData } = useContext(CustomerContext);
  const [data, setData] = contextData;
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  
  const [sm, updateSm] = useState(false);
  const [onSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(10);

  // Fetch users from database
  const getUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setData(response.data);
      
      // حساب الإحصائيات
      setTotalUsers(response.data.length);
      setActiveUsers(response.data.filter(user => !user.isBanned).length);
      setBannedUsers(response.data.filter(user => user.isBanned).length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Ban/Unban user
  const toggleBanUser = async (id) => {
    try {
      const user = data.find(item => item.id === id);
      const newBanStatus = !user.isBanned;
      
      await axios.patch(`http://localhost:5000/api/users/${id}`, {
        isBanned: newBanStatus
      });
      
      getUsers();
    } catch (error) {
      console.error('Error banning/unbanning user:', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <React.Fragment>
      <Head title="إدارة المستخدمين"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                إدارة المستخدمين
              </BlockTitle>
              <BlockDes className="text-soft">
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <span className="text-dark fw-bold">{totalUsers}</span> إجمالي المستخدمين
                  </div>
                  <div>
                    <span className="text-success fw-bold">{activeUsers}</span> مستخدم نشط
                  </div>
                  <div>
                    <span className="text-danger fw-bold">{bannedUsers}</span> مستخدم محظور
                  </div>
                </div>
              </BlockDes>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="nk-tb-list is-separate is-medium mb-3">
            <DataTableHead className="nk-tb-item">
              <DataTableRow>
                <span className="sub-text">الاسم</span>
              </DataTableRow>
              <DataTableRow size="mb">
                <span className="sub-text">البريد الإلكتروني</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">رقم الهاتف</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">تاريخ الإنشاء</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">آخر تحديث</span>
              </DataTableRow>
              <DataTableRow size="sm">
                <span className="sub-text">الحالة</span>
              </DataTableRow>
              <DataTableRow className="nk-tb-col-tools text-end">
                <span className="sub-text">خيارات</span>
              </DataTableRow>
            </DataTableHead>

            {currentItems.length > 0 ? currentItems.map((item) => (
              <DataTableItem key={item.id}>
                <DataTableRow>
                  <Link to={`${process.env.PUBLIC_URL}/user-details/${item.id}`}>
                    <div className="user-card">
                      <UserAvatar theme="primary" text={findUpper(item.name)} />
                      <div className="user-info">
                        <span className="tb-lead">{item.name}</span>
                      </div>
                    </div>
                  </Link>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span>{item.email}</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span>{item.phone || '---'}</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span>{moment(item.createdAt).format('YYYY/MM/DD HH:mm')}</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span>{moment(item.updatedAt).format('YYYY/MM/DD HH:mm')}</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <Badge color={item.isBanned ? "danger" : "success"}>
                    {item.isBanned ? 'محظور' : 'نشط'}
                  </Badge>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools">
                  <ul className="nk-tb-actions gx-1">
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                          <Icon name="more-h"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <ul className="link-list-opt no-bdr">
                            <li onClick={() => toggleBanUser(item.id)}>
                              <DropdownItem tag="a" href="#ban">
                                <Icon name={item.isBanned ? 'user-check' : 'user-cross'}></Icon>
                                <span>{item.isBanned ? 'فك الحظر' : 'حظر المستخدم'}</span>
                              </DropdownItem>
                            </li>
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </DataTableRow>
              </DataTableItem>
            )) : (
              <div className="text-center p-4">
                <span className="text-silent">لا يوجد مستخدمين مسجلين</span>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <PreviewAltCard>
              <PaginationComponent
                itemPerPage={itemPerPage}
                totalItems={data.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </PreviewAltCard>
          )}
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default CustomerList;