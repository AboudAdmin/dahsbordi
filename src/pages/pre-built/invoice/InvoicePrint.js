import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Icon, Block } from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import LogoDark from "../../../images/logo-dark.png";
import { useParams } from "react-router-dom";

const InvoicePrint = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let { orderId } = useParams();

  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        
        if (!response.data) {
          throw new Error("Order not found");
        }
        
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch order details");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Content>
        <Block>
          <div className="text-center">Loading order details...</div>
        </Block>
      </Content>
    );
  }

  if (error) {
    return (
      <Content>
        <Block>
          <div className="alert alert-danger">{error}</div>
        </Block>
      </Content>
    );
  }

  if (!order) {
    return (
      <Content>
        <Block>
          <div className="text-center">Order not found</div>
        </Block>
      </Content>
    );
  }

  // Calculate totals from order items
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = order.shippingFee || 0;
  const total = subtotal + tax + shipping;

  return (
    <body className="bg-white">
      <Head title="Invoice Print"></Head>
      <Content>
        <Block>
          <div className="invoice invoice-print">
            <div className="invoice-wrap">
              <div className="invoice-brand text-center">
                <img src={LogoDark} alt="" />
              </div>

              <div className="invoice-head">
                <div className="invoice-contact">
                  <span className="overline-title">Invoice To</span>
                  <div className="invoice-contact-info">
                    <h4 className="title">{order.fullName}</h4>
                    <ul className="list-plain">
                      <li>
                        <Icon name="map-pin-fill"></Icon>
                        <span>
                          {order.address}, {order.city}, {order.country}, {order.postalCode}
                        </span>
                      </li>
                      <li>
                        <Icon name="call-fill"></Icon>
                        <span>{order.phone}</span>
                      </li>
                      <li>
                        <Icon name="mail-fill"></Icon>
                        <span>{order.email}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="invoice-desc">
                  <h3 className="title">Order Invoice</h3>
                  <ul className="list-plain">
                    <li className="invoice-id">
                      <span>Order ID</span>:<span>{order.orderId || order.id}</span>
                    </li>
                    <li className="invoice-date">
                      <span>Date</span>:<span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </li>
                    <li className="invoice-payment">
                      <span>Payment</span>:<span>
                        {order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                         order.paymentMethod === 'check' ? 'Check' : 'Cash on Delivery'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="invoice-bills">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.image && (
                                <img 
                                  src={`http://localhost:5000/upload/${item.image}`} 
                                  alt={item.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                                />
                              )}
                              <div>
                                <h6 className="mb-0">{item.name}</h6>
                                {item.id && <small className="text-muted">ID: {item.id}</small>}
                              </div>
                            </div>
                          </td>
                          <td>{item.price.toFixed(2)} D</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price * item.quantity).toFixed(2)} D</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Subtotal</td>
                        <td>{subtotal.toFixed(2)} D</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Tax (10%)</td>
                        <td>{tax.toFixed(2)} D</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Shipping</td>
                        <td>{shipping.toFixed(2)} D</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end fw-bold">Grand Total</td>
                        <td className="fw-bold">{total.toFixed(2)} D</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="nk-notes ff-italic fs-12px text-soft">
                    Invoice was created on a computer and is valid without the signature and seal.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Block>
      </Content>
    </body>
  );
};

export default InvoicePrint;