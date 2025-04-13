import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge, Button, Modal, ModalBody } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const OrderManagement = () => {
  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("view"); // 'view' or 'add'


  // Fetch orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle form submission
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = async (data) => {
    try {
      const orderData = {
        ...data,
        total: parseFloat(data.total),
        status: "en attente",
        date: new Date().toISOString()
      };
      
      const { data: newOrder } = await axios.post("http://localhost:5000/api/orders", orderData);
      setOrders([newOrder, ...orders]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`);
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // Handle status update
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="container">
      <h2>Order Management</h2>
      
      <Button color="primary" onClick={() => {
        setSelectedOrder(null);
        setModalType("add");
        setIsModalOpen(true);
      }}>
        Add New Order
      </Button>

      <div className="table-responsive mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.fullName}</td>
                <td>${Number(order.total).toFixed(2)}</td>
                <td>
                  <Badge color={
                    order.status === "payé" ? "success" :
                    order.status === "envoyé" ? "info" :
                    order.status === "reçu" ? "primary" : "warning"
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td>
                  <Link to={`${order.id}`} >
                  
                  view
                  </Link>
                  <Button 
                    size="sm" 
                    color="danger" 
                    className="ms-2"
                    onClick={() => handleDelete(order.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/View */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)}>
        <ModalBody>
          {modalType === "add" ? (
            <>
              <h4>Add New Order</h4>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Customer Name</label>
                  <input 
                    className="form-control" 
                    {...register("fullName", { required: true })} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    {...register("email", { required: true })} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Total Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    {...register("total", { required: true })} 
                  />
                </div>
                <Button type="submit" color="primary">Submit</Button>
              </form>
            </>
          ) : (
            selectedOrder && (
              <>
                <h4>Order Details</h4>
                <p><strong>ID:</strong> {selectedOrder.id}</p>
                <p><strong>Customer:</strong> {selectedOrder.fullName}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                
                
                
                
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p> 
                <p><strong>Status:</strong> 
                
                  <select 
                    className="form-select ms-2" 
                    style={{width: 'auto', display: 'inline-block'}}
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  >
                    <option value="en attente">Pending</option>
                    <option value="payé">Paid</option>
                    <option value="envoyé">Shipped</option>
                    <option value="reçu">Delivered</option>
                  </select>
                </p>
                <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
              </>
            )
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default OrderManagement;