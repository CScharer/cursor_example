# 🛒 Online Store - Full Stack Application

A modern full-stack online store application built with React (TypeScript) frontend and FastAPI (Python) backend, using SQLite database.

## 🏗️ Architecture

- **Frontend**: React with TypeScript
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Styling**: Modern CSS with gradients and animations

## 📁 Project Structure

```
cursor_example/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx    # Main application component
│   │   ├── App.css    # Modern styling
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/            # FastAPI Python backend
│   ├── main.py        # FastAPI application with API endpoints
│   ├── seed_data.py   # Database seeding script
│   ├── requirements.txt
│   ├── venv/          # Python virtual environment
│   └── store.db       # SQLite database
├── database/           # Database related files
└── README.md
```

## 🚀 Features

### Products
- View all available products
- Product categories (Electronics, Appliances, Sports, Accessories)
- Real-time stock tracking
- Beautiful product cards with hover effects

### Orders
- Place orders with customer information
- Automatic stock deduction
- Order validation (stock availability)
- Success notifications

### API Endpoints
- `GET /products` - List all products
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `GET /orders` - List all orders
- `POST /orders` - Place new order

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/CScharer/cursor_example.git
   cd cursor_example
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Seed the Database**
   ```bash
   python seed_data.py
   ```

## 🏃‍♂️ Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📊 Database Schema

### Products Table
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price (float)
- `category`: Product category
- `stock`: Available quantity
- `created_at`: Timestamp

### Orders Table
- `id`: Primary key
- `customer_name`: Customer name
- `customer_email`: Customer email
- `product_id`: Reference to product
- `quantity`: Order quantity
- `total_price`: Calculated total price
- `created_at`: Timestamp

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds and glass-morphism effects
- **Responsive Layout**: Mobile-friendly grid system
- **Interactive Elements**: Hover animations and smooth transitions
- **Modal System**: Clean order placement interface
- **Real-time Updates**: Stock levels update after orders

## 🔧 Technologies Used

### Frontend
- React 18
- TypeScript
- CSS3 with modern features (Grid, Flexbox, Animations)
- Fetch API for HTTP requests

### Backend
- FastAPI
- SQLAlchemy ORM
- Pydantic for data validation
- Uvicorn ASGI server
- CORS middleware

### Database
- SQLite with SQLAlchemy
- Automatic table creation
- Sample data seeding

## 📝 API Documentation

The FastAPI backend provides automatic API documentation at `/docs` when running.

### Sample API Calls

**Get all products:**
```bash
curl http://localhost:8000/products
```

**Place an order:**
```bash
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_id": 1,
    "quantity": 2
  }'
```

## 🧪 Testing

This project includes comprehensive API and database tests using Playwright with TypeScript.

### Running Tests

1. **Install test dependencies** (if not already done):
   ```bash
   npm install
   npx playwright install
   ```

2. **Run all tests**:
   ```bash
   npm test
   ```

3. **Run specific test suites**:
   ```bash
   npm run test:api      # API endpoint tests
   npm run test:db       # Database integration tests
   ```

4. **Run tests with browser UI** (for debugging):
   ```bash
   npm run test:headed
   ```

5. **Debug tests**:
   ```bash
   npm run test:debug
   ```

6. **View test reports**:
   ```bash
   npm run test:report
   ```

### Test Coverage

- **Products API**: CRUD operations, validation, error handling
- **Orders API**: Order creation, stock management, validation
- **Database Integration**: Data consistency, transactions, referential integrity
- **Edge Cases**: Concurrent orders, stock limits, invalid data

### Test Structure

```
tests/
├── products.api.spec.ts    # Product endpoint tests
├── orders.api.spec.ts      # Order endpoint tests
├── database.db.spec.ts     # Database integration tests
└── helpers/
    └── test-utils.ts       # Test utility functions
```

## 🚀 Deployment

### Frontend
The React app can be built for production:
```bash
cd frontend
npm run build
```

### Backend
The FastAPI backend can be deployed with:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Christopher Scharer**
- Email: ChrisScharer1416@msn.com
- GitHub: [@CScharer](https://github.com/CScharer)

---

Built with ❤️ using React, FastAPI, and modern web technologies.
