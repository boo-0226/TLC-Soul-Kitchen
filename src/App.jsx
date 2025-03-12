import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const AdminPage = ({ menuItems, setMenuItems, addMenuItem, deleteMenuItem, preorders, setPreorders, updateOrderStatus, deleteOrder }) => {
  const [category, setCategory] = useState('Soul Food');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('menu-management');

  useEffect(() => {
    if (editingItem) {
      console.log('Populating form with:', editingItem);
      setCategory(editingItem.category || 'Soul Food');
      setName(editingItem.name || '');
      setPrice(editingItem.price ? editingItem.price.toString() : '');
      setDescription(editingItem.description || '');
    } else {
      setCategory('Soul Food');
      setName('');
      setPrice('');
      setDescription('');
    }
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    const updatedItem = {
      category,
      name,
      price: price ? parseFloat(price) : 0,
      description,
      id: editingItem ? editingItem.id : Date.now(),
    };
    console.log('Updated item:', updatedItem);

    if (editingItem) {
      console.log('Editing item with ID:', editingItem.id);
      setMenuItems(prevItems =>
        prevItems.map(item => (item.id === editingItem.id ? { ...item, ...updatedItem } : item))
      );
      setEditingItem(null);
    } else {
      console.log('Adding new item');
      await addMenuItem(updatedItem);
    }
    setName('');
    setPrice('');
    setDescription('');
  };

  const categories = ['Soul Food', 'Sides', 'Desserts', 'Drinks'];
  const filteredItems =
    filterCategory === 'All'
      ? [...menuItems].sort((a, b) => a.category.localeCompare(b.category))
      : menuItems.filter(item => item.category === filterCategory);

  const groupedItems = filterCategory === 'All'
    ? categories.reduce((acc, category) => {
        acc[category] = filteredItems.filter(item => item.category === category);
        return acc;
      }, {})
    : { [filterCategory]: filteredItems };

  const totalEarnings = preorders
    .filter(order => order.status === 'complete')
    .reduce((sum, order) => sum + order.total, 0);

  const handleCancelOrder = async (index) => {
    const order = preorders[index];
    if (order.id) {
      await updateOrderStatus(order.id, 'cancelled');
      setPreorders(prev =>
        prev.map((o, i) => (i === index ? { ...o, status: 'cancelled' } : o))
      );
    }
  };

  const handleCompleteOrder = async (index) => {
    const order = preorders[index];
    if (order.id) {
      await updateOrderStatus(order.id, 'complete');
      setPreorders(prev =>
        prev.map((o, i) => (i === index ? { ...o, status: 'complete' } : o))
      );
    }
  };

  const handleDeleteOrder = async (index) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const order = preorders[index];
      if (order.id) {
        await deleteOrder(order.id);
        setPreorders(prev => prev.filter((_, i) => i !== index));
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'menu-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu-management')}
        >
          Menu Management
        </button>
        <button
          className={`tab-button ${activeTab === 'preorder-dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('preorder-dashboard')}
        >
          Preorder Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'live-preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('live-preview')}
        >
          Live Menu Preview
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'menu-management' && (
          <div className="admin-left">
            <div className="admin-form">
              <h2 className="admin-title">
                {editingItem ? 'Edit Menu Item' : 'Admin Page - Add Menu Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Category:
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Soul Food">Soul Food</option>
                    <option value="Sides">Sides</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </label>
                <br />
                <label>
                  Item Name:
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Price:
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Description:
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
                <button type="submit" className="submit-button">
                  {editingItem ? 'Save Changes' : 'Add Menu Item'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <h3 className="admin-title">Filter Menu Items</h3>
            <label>
              Filter by Category:
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Soul Food">Soul Food</option>
                <option value="Sides">Sides</option>
                <option value="Desserts">Desserts</option>
                <option value="Drinks">Drinks</option>
              </select>
            </label>

            <div className="admin-list">
              <h3 className="admin-title">Active Menu Items:</h3>
              {filterCategory === 'All' ? (
                categories.map(category => (
                  groupedItems[category].length > 0 && (
                    <div key={category}>
                      <h4 className="category-header">{category}</h4>
                      <ul>
                        {groupedItems[category].map(item => (
                          <li key={item.id}>
                            {item.name} - ${item.price.toFixed(2)}
                            <div className="button-group">
                              <button
                                className="delete-button"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this item?')) {
                                    deleteMenuItem(item.id);
                                  }
                                }}
                              >
                                Delete
                              </button>
                              <button
                                className="edit-button"
                                onClick={() => setEditingItem(item)}
                              >
                                Edit
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))
              ) : (
                <ul>
                  {filteredItems.map(item => (
                    <li key={item.id}>
                      {item.name} - ${item.price.toFixed(2)}
                      <div className="button-group">
                        <button
                          className="delete-button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              deleteMenuItem(item.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="edit-button"
                          onClick={() => setEditingItem(item)}
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preorder-dashboard' && (
          <div className="preorder-dashboard">
            <h3 className="admin-title">Preorder Dashboard</h3>
            <p><strong>Total Earnings from Completed Orders:</strong> ${totalEarnings.toFixed(2)}</p>
            {preorders.length > 0 ? (
              <ul>
                {preorders.map((order, index) => (
                  <li key={index} className={`order-item ${order.status || 'pending'}`}>
                    <strong>Order #{index + 1}</strong> - Location: {order.location}, Total: ${order.total.toFixed(2)}
                    <ul>
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.name} x{item.quantity} - ${item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <p>Customer Name: {order.customerName || 'Not provided'}</p>
                    <p>Phone Number: {order.phone || 'Not provided'}</p>
                    <p>Special Request: {order.instructions || 'None'}</p>
                    <p>Timestamp: {new Date(order.timestamp).toLocaleString()}</p>
                    <p>Status: {order.status || 'pending'}</p>
                    <div className="order-actions">
                      <button
                        className="action-button cancel"
                        onClick={() => handleCancelOrder(index)}
                        disabled={order.status === 'cancelled' || order.status === 'complete'}
                      >
                        Cancel
                      </button>
                      <button
                        className="action-button complete"
                        onClick={() => handleCompleteOrder(index)}
                        disabled={order.status === 'complete' || order.status === 'cancelled'}
                      >
                        Complete
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteOrder(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No preorders yet.</p>
            )}
          </div>
        )}

        {activeTab === 'live-preview' && (
          <div className="admin-right">
            <h2>Live Menu Preview</h2>
            <div className="menu-preview">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="menu-category">{category}</h3>
                  <ul>
                    {menuItems
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <li key={item.id} className="menu-item">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            {item.description && (
                              <p className="item-description">{item.description}</p>
                            )}
                          </div>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerPage = ({ menuItems, preorders, addPreorder }) => {
  console.log('CustomerPage received menuItems:', menuItems);
  const [selectedItems, setSelectedItems] = useState([]);
  const [location, setLocation] = useState('Pflugerville');
  const [instructions, setInstructions] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [errors, setErrors] = useState({ customerName: '', phone: '' });

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddItem = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  };

  const validateForm = () => {
    const newErrors = { customerName: '', phone: '' };
    let isValid = true;

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
      isValid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      items: selectedItems,
      location,
      total,
      instructions,
      timestamp: new Date().toISOString(),
      status: 'pending',
      customerName,
      phone,
    };
    await addPreorder(order);
    setConfirmation(order);
    setSelectedItems([]);
    setLocation('Pflugerville');
    setInstructions('');
    setCustomerName('');
    setPhone('');
    setErrors({ customerName: '', phone: '' });
  };

  const categories = ['Soul Food', 'Sides', 'Desserts', 'Drinks'];
  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = menuItems.filter(item => item.category === category);
    return acc;
  }, {});

  const isFormValid = selectedItems.length > 0 && customerName.trim() && phone.trim() && validateForm();

  return (
    <div className="menu-container">
      <h2 className="customer-title">TLC Soul Kitchen - Preorder Menu</h2>

      {categories.map(category => (
        <div key={category}>
          <h3 className="menu-category">{category}</h3>
          <ul>
            {groupedItems[category].map((item) => (
              <li key={item.id} className="menu-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                </div>
                <span className="item-price">${item.price.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => handleAddItem(item)}
                  aria-label={`Add ${item.name} to order`}
                >
                  Add to Order
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="preorder-form">
        <h3>Place Your Preorder</h3>
        <p className="preorder-info">
          Address will be sent to you after pre-order is submitted by <strong>Friday, March 14</strong>. 
          Pick up hours are between 12:00 PM - 9:00 PM on <strong>March 15-16</strong>. 
          Two days of pre-orders: the last day for pre-orders will be closed <strong>Friday, March 14</strong> 
          for Saturday, and <strong>Saturday, March 15</strong> is the last day for pre-order for Sunday night, 
          <strong>March 16</strong>. Thank you all for your support!
        </p>
        <form onSubmit={handleSubmitOrder}>
          <div>
            <h4>Selected Items</h4>
            {selectedItems.length > 0 ? (
              <ul>
                {selectedItems.map(item => (
                  <li key={item.id}>
                    {item.name} x
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    {item.quantity}
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                    - ${item.price.toFixed(2)}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Remove ${item.name} from order`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items selected.</p>
            )}
            {selectedItems.length > 0 && (
              <p className="subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
            )}
          </div>
          <label>
            Location: Pflugerville
          </label>
          <br />
          <label htmlFor="customerName">
            Customer Name:<span className="required-asterisk">*</span>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setErrors(prev => ({ ...prev, customerName: '' }));
              }}
              placeholder="Enter your name"
              required
              aria-describedby="customerName-error"
            />
            {errors.customerName && (
              <span className="error-message" id="customerName-error">
                {errors.customerName}
              </span>
            )}
          </label>
          <br />
          <label htmlFor="phone">
            Phone Number:<span className="required-asterisk">*</span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors(prev => ({ ...prev, phone: '' }));
              }}
              placeholder="Enter your phone number (e.g., 123-456-7890)"
              required
              aria-describedby="phone-error"
            />
            {errors.phone && (
              <span className="error-message" id="phone-error">
                {errors.phone}
              </span>
            )}
          </label>
          <br />
          <label htmlFor="instructions">
            Special Request:
            <input
              type="text"
              id="instructions"
              name="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., 'Please prepare by 6 PM'"
            />
          </label>
          <br />
          <button type="submit" className="submit-button" disabled={!isFormValid}>
            Submit Preorder
          </button>
        </form>

        {confirmation && (
          <div className="confirmation-modal">
            <h3>Order Confirmation</h3>
            <p><strong>Order Details:</strong></p>
            <ul>
              {confirmation.items.map(item => (
                <li key={item.id}>
                  {item.name} x{item.quantity} - ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p><strong>Location:</strong> {confirmation.location}</p>
            <p><strong>Customer Name:</strong> {confirmation.customerName}</p>
            <p><strong>Phone Number:</strong> {confirmation.phone}</p>
            <p><strong>Total Cost:</strong> ${confirmation.total.toFixed(2)}</p>
            <p><strong>Special Request:</strong> {confirmation.instructions || 'None'}</p>
            <p><strong>Timestamp:</strong> {new Date(confirmation.timestamp).toLocaleString()}</p>
            <button type="button" onClick={() => setConfirmation(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'password123';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const menuResponse = await fetch('/api/getMenu');
        if (!menuResponse.ok) throw new Error('Failed to fetch menu items');
        const menuData = await menuResponse.json();
        setMenuItems(menuData);

        const ordersResponse = await fetch('/api/getOrders');
        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
        const ordersData = await ordersResponse.json(); // Corrected: Use ordersResponse
        setPreorders(ordersData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const addMenuItem = async (item) => {
    try {
      const response = await fetch('/api/addMenuItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add menu item');
      const newItem = await response.json();
      setMenuItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      const response = await fetch(`/api/deleteMenuItem/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete menu item');
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const addPreorder = async (order) => {
    try {
      const response = await fetch('/api/submitOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error('Failed to submit order');
      const newOrder = await response.json();
      setPreorders(prevOrders => [...prevOrders, newOrder]);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch('/api/updateOrderStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/deleteOrder/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete order');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const CustomerPageWithProps = () => (
    <CustomerPage menuItems={menuItems} preorders={preorders} addPreorder={addPreorder} />
  );

  const AdminPageWithProps = () => (
    <AdminPage
      menuItems={menuItems}
      setMenuItems={setMenuItems}
      addMenuItem={addMenuItem}
      deleteMenuItem={deleteMenuItem}
      preorders={preorders}
      setPreorders={setPreorders}
      updateOrderStatus={updateOrderStatus}
      deleteOrder={deleteOrder}
    />
  );

  return (
    <Router>
      <div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!isLoading && !error && (
          <Routes>
            <Route path="/" element={<CustomerPageWithProps />} />
            <Route
              path="/admin"
              element={
                isAuthenticated ? (
                  <>
                    <AdminPageWithProps />
                    <button className="logout-button" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="login-container">
                    <h2 className="admin-title">Admin Login</h2>
                    <form onSubmit={handleLogin}>
                      <label>
                        Username:
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </label>
                      <br />
                      <label>
                        Password:
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </label>
                      <br />
                      <button type="submit" className="submit-button">
                        Login
                      </button>
                      {loginError && <p className="error-message">{loginError}</p>}
                    </form>
                  </div>
                )
              }
            />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;