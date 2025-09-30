import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Upload, Search, Package } from 'lucide-react';
import UploadProduct from './components/UploadProduct';
import SearchProducts from './components/SearchProducts';
import ProductCatalog from './components/ProductCatalog';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Package, label: 'Catálogo' },
    { path: '/upload', icon: Upload, label: 'Subir Producto' },
    { path: '/search', icon: Search, label: 'Buscar' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Package size={24} />
          <span>Catálogo de Productos</span>
        </Link>
        
        <div className="nav-links">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<ProductCatalog />} />
              <Route path="/upload" element={<UploadProduct />} />
              <Route path="/search" element={<SearchProducts />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
