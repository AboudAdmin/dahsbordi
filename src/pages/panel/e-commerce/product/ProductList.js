import React, { useState, useEffect } from "react";
import axios from 'axios'; // استيراد axios

import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";


import {
  Block,
  BlockHead,
  BlockTitle,
  BlockBetween,
  BlockHeadContent,
  BlockDes,
  Icon,
  Row,
  Col,
  Button,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
  RSelect,
  PreviewAltCard,
} from "../../../../components/Component";
import { DropdownItem, UncontrolledDropdown, DropdownMenu, DropdownToggle, Badge } from "reactstrap";
import { productData, categoryOptions } from "./ProductData";
import SimpleBar from "simplebar-react";
import { useForm } from "react-hook-form";
import ProductH from "../../../../images/product/h.png";
import Dropzone from "react-dropzone";
import { Modal, ModalBody } from "reactstrap";
import { upload } from "@testing-library/user-event/dist/cjs/utility/upload.js";


const ProductList = () => {
  const [data, setData] = useState(productData);
  const [sm, updateSm] = useState(false);
  const [img, setImg] = useState(null);
  const [formData, setFormData] = useState({
      name: "",
      img: null,
      quantity: "",
      price: 0,
      description: 0,
      marque: "",
      statut: false,
      categoryId: [],

  });
  const [editId, setEditedId] = useState();
  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
  });
  const [onSearchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [files, setFiles] = useState([]);

  const getProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product');
      console.log('Data from backend:', response.data);
      
      setData(response.data); // تعيين البيانات في الحالة
    } catch (error) {
      console.error('There was an error with the axios request:', error);
    }
  };

  // استخدام useEffect لاستدعاء الـ API عند تحميل المكون
  useEffect(() => {
    getProducts();
  }, []);

  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = data.filter((item) => {
        return item.sku.toLowerCase().includes(onSearchText.toLowerCase());
      });
      setData([...filteredObject]);
    } else {
      getProducts(); // إعادة جلب البيانات الأصلية عند عدم وجود نص بحث
    }
  }, [onSearchText]);

  




  // function to close the form modal
  const onFormCancel = () => {
    setView({ edit: false, add: false, details: false });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      img: null,
      quantity: "",
      price: 0,
      description: 0,
      marque: "",
      statut: false,
      categoryId: [],
    });
    reset({});
  };

  const onFormSubmit = async (form) => {
    const { name, price, quantity,img, description, marque,statut,categoryId} = form;
    let submittedData = {
      name: name,
      price: price,
      quantity: quantity,
      description: description,
      marque: marque,
      statut: statut,
      categoryId: categoryId,
      img : img
    };
    console.log('Submitted data:', submittedData);

    try {
      if (!img) {
        setMessage('Please select a file first.');
        return;
      }
  
      const formData = new FormData();
      formData.append('img', img); // "img" should match the name expected by your backend
  
      try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        });
  
        setMessage('File uploaded successfully!');
      } catch (error) {
        console.error(error);
        setMessage('Upload failed!');
      }
      const response = await axios.post('http://localhost:5000/api/product', submittedData);
      console.log('Product added:', response.data);
      setData([response.data, ...data]); // إضافة البيانات الجديدة إلى الحالة
      resetForm();
      setView({ add: false });
    } catch (error) {
      console.error('There was an error with the axios request:', error);
    }
  };
  const upload_file = async (e) => {
    setImg(e.target.files[0]);
    console.log(img)
  
    
  };

  const onEditSubmit = () => {
    let submittedData;
    let newItems = data;
    let index = newItems.findIndex((item) => item.id === editId);

    newItems.forEach((item) => {
      if (item.id === editId) {
        submittedData = {
          id: editId,
          name: formData.name,
          img: files.length > 0 ? files[0].preview : item.img,
          sku: formData.sku,
          price: formData.price,
          salePrice: formData.salePrice,
          stock: formData.stock,
          category: formData.category,
          fav: false,
          check: false,
        };
      }
    });
    newItems[index] = submittedData;
    //setData(newItems);
    resetForm();
    setView({ edit: false, add: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.id === id) {
        setFormData({
          name: item.name,
          img: item.img,
          sku: item.sku,
          price: item.price,
          stock: item.stock,
          category: item.category,
          fav: false,
          check: false,
        });
      }
    });
    setEditedId(id);
    setFiles([]);
    setView({ add: false, edit: true });
  };

  useEffect(() => {
    reset(formData)
  }, [formData]);

  // selects all the products
  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.check = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  // selects one product
  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].check = e.currentTarget.checked;
    setData([...newData]);
  };

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to delete a product
  const deleteProduct = (id) => {
    let defaultData = data;
    defaultData = defaultData.filter((item) => item.id !== id);
    setData([...defaultData]);
  };

  // function to delete the seletected item
  const selectorDeleteProduct = () => {
    let newData;
    newData = data.filter((item) => item.check !== true);
    setData([...newData]);
  };

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      edit: type === "edit" ? true : false,
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
    });
  };

  // handles ondrop function of dropzone
  const handleDropChange = (acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  };

  // Get current list, pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  return (
    <React.Fragment>
      <Head title="Products"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Products</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <a
                  href="#more"
                  className="btn btn-icon btn-trigger toggle-expand me-n1"
                  onClick={(ev) => {
                    ev.preventDefault();
                    updateSm(!sm);
                  }}
                >
                  <Icon name="more-v"></Icon>
                </a>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li>
                      <div className="form-control-wrap">
                        <div className="form-icon form-icon-right">
                          <Icon name="search"></Icon>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          id="default-04"
                          placeholder="Quick search by SKU"
                          onChange={(e) => onFilterChange(e)}
                        />
                      </div>
                    </li>
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle
                          color="transparent"
                          className="dropdown-toggle dropdown-indicator btn btn-outline-light btn-white"
                        >
                          Status
                        </DropdownToggle>
                        <DropdownMenu end>
                          <ul className="link-list-opt no-bdr">
                            <li>
                              <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                                <span>New Items</span>
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                                <span>Featured</span>
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                                <span>Out of Stock</span>
                              </DropdownItem>
                            </li>
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                    <li className="nk-block-tools-opt">
                      <Button
                        className="toggle btn-icon d-md-none"
                        color="primary"
                        onClick={() => {
                          toggle("add");
                        }}
                      >
                        <Icon name="plus"></Icon>
                      </Button>
                      <Button
                        className="toggle d-none d-md-inline-flex"
                        color="primary"
                        onClick={() => {
                          toggle("add");
                        }}
                      >
                        <Icon name="plus"></Icon>
                        <span>Add Product</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
  <div className="nk-tb-list is-separate is-medium mb-3">
    <DataTableHead className="nk-tb-item">
      <DataTableRow className="nk-tb-col-check">
        <div className="custom-control custom-control-sm custom-checkbox notext">
          <input
            type="checkbox"
            className="custom-control-input"
            id="uid_1"
            onChange={(e) => selectorCheck(e)}
          />
          <label className="custom-control-label" htmlFor="uid_1"></label>
        </div>
      </DataTableRow>
      <DataTableRow size="sm">
        <span>ID</span>
      </DataTableRow>
      <DataTableRow>
        <span>Price</span>
      </DataTableRow>
      <DataTableRow>
        <span>Quantity</span>
      </DataTableRow>
      <DataTableRow>
        <span>Description</span>
      </DataTableRow>
      <DataTableRow>
        <span>Marque</span>
      </DataTableRow>
      <DataTableRow>
        <span>category</span>
      </DataTableRow>
      {/* <DataTableRow>
        <span>statut</span>
      </DataTableRow> */}
      <DataTableRow className="nk-tb-col-tools">
        <ul className="nk-tb-actions gx-1 my-n1">
          <li className="me-n1">
            <UncontrolledDropdown>
              <DropdownToggle
                tag="a"
                href="#toggle"
                onClick={(ev) => ev.preventDefault()}
                className="dropdown-toggle btn btn-icon btn-trigger"
              >
                <Icon name="more-h"></Icon>
              </DropdownToggle>
              <DropdownMenu end>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem tag="a" href="#edit" onClick={(ev) => ev.preventDefault()}>
                      <Icon name="edit"></Icon>
                      <span>Edit Selected</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#remove"
                      onClick={(ev) => {
                        ev.preventDefault();
                        selectorDeleteProduct();
                      }}
                    >
                      <Icon name="trash"></Icon>
                      <span>Remove Selected</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem tag="a" href="#stock" onClick={(ev) => ev.preventDefault()}>
                      <Icon name="bar-c"></Icon>
                      <span>Update Stock</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem tag="a" href="#price" onClick={(ev) => ev.preventDefault()}>
                      <Icon name="invest"></Icon>
                      <span>Update Price</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>
          </li>
        </ul>
      </DataTableRow>
    </DataTableHead>
    {data.length > 0
      ? data.map((item) => (
          <DataTableItem key={item.id}>
            <DataTableRow className="nk-tb-col-check">
              <div className="custom-control custom-control-sm custom-checkbox notext">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  defaultChecked={item.check}
                  id={item.id + "uid1"}
                  key={Math.random()}
                  onChange={(e) => onSelectChange(e, item.id)}
                />
                <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
              </div>
            </DataTableRow>
            <DataTableRow size="sm">
              <span className="tb-product">
                <span className="title">{item.id}</span>
              </span>
            </DataTableRow>
            <DataTableRow>
              <span className="tb-sub">$ {item.price}</span>
            </DataTableRow>
            <DataTableRow>
              <span className="tb-sub">{item.quantity}</span>
            </DataTableRow>
            <DataTableRow>
              <span className="tb-sub">{item.description}</span>
            </DataTableRow>
            <DataTableRow>
              <span className="tb-sub">{item.marque}</span>
            </DataTableRow>
            <DataTableRow className="nk-tb-col-tools">
              <ul className="nk-tb-actions gx-1 my-n1">
                <li className="me-n1">
                  <UncontrolledDropdown>
                    <DropdownToggle
                      tag="a"
                      href="#more"
                      onClick={(ev) => ev.preventDefault()}
                      className="dropdown-toggle btn btn-icon btn-trigger"
                    >
                      <Icon name="more-h"></Icon>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <ul className="link-list-opt no-bdr">
                        <li>
                          <DropdownItem
                            tag="a"
                            href="#edit"
                            onClick={(ev) => {
                              ev.preventDefault();
                              onEditClick(item.id);
                              toggle("edit");
                            }}
                          >
                            <Icon name="edit"></Icon>
                            <span>Edit Product</span>
                          </DropdownItem>
                        </li>
                        <li>
                          <DropdownItem
                            tag="a"
                            href="#view"
                            onClick={(ev) => {
                              ev.preventDefault();
                              onEditClick(item.id);
                              toggle("details");
                            }}
                          >
                            <Icon name="eye"></Icon>
                            <span>View Product</span>
                          </DropdownItem>
                        </li>
                        <li>
                          <DropdownItem
                            tag="a"
                            href="#remove"
                            onClick={(ev) => {
                              ev.preventDefault();
                              deleteProduct(item.id);
                            }}
                          >
                            <Icon name="trash"></Icon>
                            <span>Remove Product</span>
                          </DropdownItem>
                        </li>
                      </ul>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </li>
              </ul>
            </DataTableRow>
          </DataTableItem>
        ))
      : null}
  </div>
  <PreviewAltCard>
    {data.length > 0 ? (
      <PaginationComponent
        itemPerPage={itemPerPage}
        totalItems={data.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    ) : (
      <div className="text-center">
        <span className="text-silent">No products found</span>
      </div>
    )}
  </PreviewAltCard>
</Block>
        <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Update Product</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onEditSubmit)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="product-title">
                          Product Title
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register('name', {
                              required: "This field is required",
                            })}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                          {errors.name && <span className="invalid">{errors.name.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="regular-price">
                          Regular Price
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            {...register('price', { required: "This is required" })}
                            className="form-control"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}/>
                          {errors.price && <span className="invalid">{errors.price.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="sale-price">
                          Sale Price
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register('salePrice')}
                            value={formData.salePrice} 
                            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}/>
                          {errors.salePrice && <span className="invalid">{errors.salePrice.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="stock">
                          Stock
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register('stock', { required: "This is required" })}
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                          {errors.stock && <span className="invalid">{errors.stock.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="SKU">
                          SKU
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register('sku', { required: "This is required" })}
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}/>
                          {errors.sku && <span className="invalid">{errors.sku.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="category">
                          Category
                        </label>
                        <div className="form-control-wrap">
                          <RSelect
                            isMulti
                            options={categoryOptions}
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                            //ref={register({ required: "This is required" })}
                          />
                          {errors.category && <span className="invalid">{errors.category.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col size="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="category">
                          Product Image
                        </label>
                        <div className="form-control-wrap">
                          <img src={formData.img} alt=""></img>
                        </div>
                      </div>
                    </Col>
                    <Col size="6">
                      <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              {...getRootProps()}
                              className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                            >
                              <input {...getInputProps()} />
                              {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
                              {files.map((file) => (
                                <div
                                  key={file.name}
                                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                >
                                  <div className="dz-image">
                                    <img src={file.preview} alt="preview" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    </Col>

                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Update Product</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <Modal isOpen={view.details} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="nk-modal-head">
              <h4 className="nk-modal-title title">
                Product <small className="text-primary">#{formData.sku}</small>
              </h4>
              <img src={formData.img} alt="" />
            </div>
            <div className="nk-tnx-details mt-sm-3">
              <Row className="gy-3">
                <Col lg={6}>
                  <span className="sub-text">Product Name</span>
                  <span className="caption-text">{formData.name}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Product Price</span>
                  <span className="caption-text">$ {formData.price}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Product Category</span>
                  <span className="caption-text">
                    {formData.categoryId.map((item, index) => (
                      <Badge key={index} className="me-1" color="secondary">
                        {item.value}
                      </Badge>
                    ))}
                  </span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Stock</span>
                  <span className="caption-text"> {formData.stock}</span>
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>

        <SimpleBar
          className={`nk-add-product toggle-slide toggle-slide-right toggle-screen-any ${
            view.add ? "content-active" : ""
          }`}
        >
          <BlockHead>
            <BlockHeadContent>
              <BlockTitle tag="h5">Add Product</BlockTitle>
              <BlockDes>
                <p>Add information or update product.</p>
              </BlockDes>
            </BlockHeadContent>
          </BlockHead>
          <Block>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Row className="g-3">
                <Col size="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-title">
                      Product Title
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="text"
                        className="form-control"
                        {...register('name', {
                          required: "This field is required",
                        })}
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="regular-price">
                    Price
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="number"
                        {...register('price', { required: "This is required" })}
                        className="form-control"
                        value={formData.price} 
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}/>
                      {errors.price && <span className="invalid">{errors.price.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sale-price">
                    Quantity
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="number"
                        className="form-control"
                        {...register('salePrice')}
                        value={formData.salePrice} 
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}/>
                      {errors.salePrice && <span className="invalid">{errors.salePrice.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="stock">
                    Description
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="number"
                        className="form-control"
                        {...register('stock', { required: "This is required" })}
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                      {errors.stock && <span className="invalid">{errors.stock.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="SKU">
                    Marque
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="text"
                        className="form-control"
                        {...register('sku', { required: "This is required" })}
                        value={formData.sku} 
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}/>
                      {errors.sku && <span className="invalid">{errors.sku.message}</span>}
                    </div>
                  </div>
                </Col>
                
                
                <Col size="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">
                      Category
                    </label>
                    <div className="form-control-wrap">
                      <RSelect
                        name="categoryId"
                        isMulti
                        options={categoryOptions}
                        onChange={(value) => setFormData({ ...formData, categoryId: value })}
                        value={formData.categoryId}
                        //ref={register({ required: "This is required" })}
                      />
                      {errors.categoryId && <span className="invalid">{errors.categoryId.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col size="14">
  <div className="form-group">
    <label className="form-label" htmlFor="statut">
      Statut
    </label>
    <div className="form-control-wrap">
      <RSelect
        name="statut"
        options={[
          { value: 'public', label: 'Public' },
          { value: 'prive', label: 'Prive' }
        ]}
        onChange={(value) => setFormData({ ...formData, statut: value })}
        value={formData.statut}
      />
      {errors.statut && <span className="invalid">{errors.statut.message}</span>}
    </div>
  </div>
</Col>
                
                <Col size="12">
                <input type="file" onChange={upload_file}/>
                  {/* <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                          <input {...getInputProps()} />
                          {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
                          {files.map((file) => (
                            <div
                              key={file.name}
                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                            >
                              <div className="dz-image">
                                <img src={file.preview} alt="preview" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </Dropzone> */}
                </Col>

                <Col size="12">
                  <Button color="primary" type="submit">
                    <Icon className="plus"></Icon>
                    <span>Add Product</span>
                  </Button>
                </Col>
              </Row>
            </form>
          </Block>
        </SimpleBar>

        {view.add && <div className="toggle-overlay" onClick={toggle}></div>}
      </Content>
    </React.Fragment>
  );
};

export default ProductList;

