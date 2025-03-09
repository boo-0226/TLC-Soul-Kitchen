import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const AdminPage = ({ menuItems, setMenuItems, addMenuItem, deleteMenuItem }) => {
  const [category, setCategory] = useState('Soul Food');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);

  // Populate form fields when editingItem changes
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

  const handleSubmit = (e) => {
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
        prevItems.map(item => (item.id === editingItem.id ? updatedItem : item))
      );
      setEditingItem(null);
    } else {
      console.log('Adding new item');
      addMenuItem(updatedItem);
    }
    setName('');
    setPrice('');
    setDescription('');
  };

  // Define categories for grouping
  const categories = ['Soul Food', 'Sides', 'Desserts', 'Drinks'];

  // Filter and sort items for the "Active Menu Items" list
  const filteredItems =
    filterCategory === 'All'
      ? // When "All" is selected, sort by category
        [...menuItems].sort((a, b) => a.category.localeCompare(b.category))
      : menuItems.filter(item => item.category === filterCategory);

  // Group items by category when "All" is selected
  const groupedItems = filterCategory === 'All'
    ? categories.reduce((acc, category) => {
        acc[category] = filteredItems.filter(item => item.category === category);
        return acc;
      }, {})
    : { [filterCategory]: filteredItems };

  return (
    <div className="admin-container">
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

        {/* Filter dropdown */}
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
            // Grouped view when "All" is selected
            categories.map(category => (
              groupedItems[category].length > 0 && (
                <div key={category}>
                  <h4 className="category-header">{category}</h4>
                  <ul>
                    {groupedItems[category].map(item => (
                      <li key={item.id}>
                        {item.name} - ${item.price.toFixed(2)}{' '}
                        <div className="button-group">
                          <button className="delete-button" onClick={() => {
                        if (window.confirm('Are you sure you want to delete this item?')) {deleteMenuItem(item.id)}}}> Delete </button>
                          <button className="edit-button" onClick={() => setEditingItem(item)}> Edit</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))
          ) : (
            // Single category view
            <ul>
              {filteredItems.map(item => (
                <li key={item.id}>
                  {item.name} - ${item.price.toFixed(2)}{' '}
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
    </div>
  );
};

const App = () => {
  const [menuItems, setMenuItems] = useState(() => {
    const storedItems = localStorage.getItem('menuItems');
    return storedItems ? JSON.parse(storedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  const addMenuItem = (item) => {
    const newItem = { ...item, id: Date.now() };
    setMenuItems(prevItems => [...prevItems, newItem]);
  };

  const deleteMenuItem = (id) => {
    setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const CustomerPage = () => {
    const categories = ['Soul Food', 'Sides', 'Desserts', 'Drinks'];

    const groupedItems = categories.reduce((acc, category) => {
      acc[category] = menuItems.filter(item => item.category === category);
      return acc;
    }, {});

    return (
      <div className="menu-container">
        <h2 className="customer-title">TLC Soul Kitchen</h2>
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
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<CustomerPage />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                addMenuItem={addMenuItem}
                deleteMenuItem={deleteMenuItem}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;