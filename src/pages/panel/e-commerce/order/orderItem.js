import React, { useState, useEffect } from "react";
import axios from "axios";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import LogoDark from "../../../../images/logo-dark.png";
import {
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  BlockDes,
  BlockHeadContent,
  Block,
  BlockBetween,
} from "../../../../components/Component";
import { useParams, Link } from "react-router-dom";

const OrderItem = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let { orderId } = useParams();

  console.log("[Debug] Component mounted with orderId:", orderId);

  useEffect(() => {
    console.log("[Debug] useEffect triggered with orderId:", orderId);

    const fetchOrder = async () => {
      try {
        console.log("[Debug] Starting to fetch order...");
        setLoading(true);
        setError(null);
        
        const apiUrl = `http://localhost:5000/api/orders/${orderId}`;
        console.log("[Debug] API URL:", apiUrl);

        const response = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }).catch(err => {
          console.error("[Debug] Axios error details:", err);
          throw err;
        });

        console.log("[Debug] API Response:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        });

        if (!response.data) {
          const error = new Error("Order data is empty");
          console.error("[Debug] Empty response data error:", error);
          throw error;
        }

        console.log("[Debug] Setting order data:", response.data);
        setOrder(response.data);
        
      } catch (err) {
        console.error("[Debug] Full error in fetchOrder:", {
          message: err.message,
          stack: err.stack,
          config: err.config,
          response: err.response,
        });

        let errorMessage = "Failed to fetch order details";
        
        if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
          console.error("[Debug] Server response data:", err.response.data);
        } else if (err.request) {
          errorMessage = "No response received from server";
          console.error("[Debug] Request was made but no response received:", err.request);
        } else {
          errorMessage = `Request error: ${err.message}`;
        }

        setError(errorMessage);
      } finally {
        console.log("[Debug] Fetch completed, setting loading to false");
        setLoading(false);
      }
    };

    if (orderId) {
      console.log("[Debug] orderId exists, calling fetchOrder");
      fetchOrder();
    } else {
      console.error("[Debug] No orderId provided");
      setError("No order ID provided");
      setLoading(false);
    }

    return () => {
      console.log("[Debug] Cleanup function called");
    };
  }, [orderId]);

  console.log("[Debug] Current state:", { loading, error, order });

  if (loading) {
    console.log("[Debug] Rendering loading state");
    return (
      <Content>
        <Block>
          <div className="text-center">Loading order details...</div>
        </Block>
      </Content>
    );
  }

  if (error) {
    console.log("[Debug] Rendering error state:", error);
    return (
      <Content>
        <Block>
          <div className="alert alert-danger">
            <h4>Error Loading Order</h4>
            <p>{error}</p>
            <pre style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          <Link to={`${process.env.PUBLIC_URL}/orders`}>
            <Button color="primary">
              <Icon name="arrow-left"></Icon>
              <span>Back to Orders</span>
            </Button>
          </Link>
        </Block>
      </Content>
    );
  }

  if (!order) {
    console.log("[Debug] Rendering no order state");
    return (
      <Content>
        <Block>
          <div className="text-center">Order not found</div>
        </Block>
      </Content>
    );
  }

  console.log("[Debug] Rendering order data:", order);

  // Calculate totals from order items
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = order.shippingFee || 0;
  const total = subtotal + tax + shipping;

  return (
    <React.Fragment>
      <Head title="Order Detail"></Head>
      <Content>
        <BlockHead>
          <BlockBetween className="g-3">
            <BlockHeadContent>
              <BlockTitle>
                Order <strong className="text-primary small">#{order.orderId || order.id}</strong>
              </BlockTitle>
              <BlockDes className="text-soft">
                <ul className="list-inline">
                  <li>
                    Order Date: <span className="text-base">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                  <li>
                    Status: <span className="text-base text-capitalize">{order.status || 'pending'}</span>
                  </li>
                </ul>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Link to={`${process.env.PUBLIC_URL}/orders`}>
                <Button color="light" outline className="bg-white d-none d-sm-inline-flex">
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
              </Link>
              <Link to={`${process.env.PUBLIC_URL}/orders`}>
                <Button color="light" outline className="btn-icon bg-white d-inline-flex d-sm-none">
                  <Icon name="arrow-left"></Icon>
                </Button>
              </Link>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="invoice">
            <div className="invoice-action">
              <Link to={`${process.env.PUBLIC_URL}/invoice-print/${order.id}`} target="_blank">
                <Button size="lg" color="primary" outline className="btn-icon btn-white btn-dim">
                  <Icon name="printer-fill"></Icon>
                </Button>
              </Link>
            </div>
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
                          <td>{item.price.toFixed(2)} ر.س</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price * item.quantity).toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Subtotal</td>
                        <td>{subtotal.toFixed(2)} ر.س</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Tax (10%)</td>
                        <td>{tax.toFixed(2)} ر.س</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end">Shipping</td>
                        <td>{shipping.toFixed(2)} ر.س</td>
                      </tr>
                      <tr>
                        <td colSpan="2"></td>
                        <td className="text-end fw-bold">Grand Total</td>
                        <td className="fw-bold">{total.toFixed(2)} ر.س</td>
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
    </React.Fragment>
  );
};

export default OrderItem;