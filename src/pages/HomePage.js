import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'React for Beginners',
      author: 'John Doe',
      cover: '📖',
      borrowed: false,
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      author: 'Jane Smith',
      cover: '📚',
      borrowed: true,
    },
    {
      id: 3,
      title: 'Web Design Essentials',
      author: 'Bob Johnson',
      cover: '🎨',
      borrowed: false,
    },
    {
      id: 4,
      title: 'Database Design',
      author: 'Alice Brown',
      cover: '💾',
      borrowed: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleBorrow = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, borrowed: !book.borrowed } : book
      )
    );
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const borrowedCount = books.filter((book) => book.borrowed).length;

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };
  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">Library System</span>
          </div>
          <div className="nav-menu">
            <a href="#home" className="nav-link active">
              Home
            </a>
            <a href="#catalog" className="nav-link">
              Catalog
            </a>
            <a href="#borrowed" className="nav-link">
              My Books
            </a>
            <a href="#profile" className="nav-link">
              Profile
            </a>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Library Management</h1>
          <p>Discover, borrow, and manage your favorite books</p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{books.length}</h3>
            <p>Total Books</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📕</div>
          <div className="stat-info">
            <h3>{borrowedCount}</h3>
            <p>Books Borrowed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{books.length - borrowedCount}</h3>
            <p>Available</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by book title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">🔍</button>
        </div>
      </section>

      {/* Books Gallery */}
      <section className="books-section">
        <div className="section-header">
          <h2>Available Books</h2>
          <p>Browse and borrow from our collection</p>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-cover">{book.cover}</div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <div className="book-status">
                    {book.borrowed ? (
                      <span className="status-badge borrowed">Borrowed</span>
                    ) : (
                      <span className="status-badge available">Available</span>
                    )}
                  </div>
                  <button
                    className={`btn-borrow ${book.borrowed ? 'return' : ''}`}
                    onClick={() => handleBorrow(book.id)}
                  >
                    {book.borrowed ? 'Return Book' : 'Borrow Book'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No books found matching your search.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Us</h4>
            <p>Your trusted library management system</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@library.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Library Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
