from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Product, Base

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./store.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Sample products
sample_products = [
    {
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "price": 199.99,
        "category": "Electronics",
        "stock": 50
    },
    {
        "name": "Coffee Maker",
        "description": "Programmable coffee maker with 12-cup capacity",
        "price": 89.99,
        "category": "Appliances",
        "stock": 25
    },
    {
        "name": "Running Shoes",
        "description": "Comfortable running shoes for daily training",
        "price": 129.99,
        "category": "Sports",
        "stock": 30
    },
    {
        "name": "Laptop Bag",
        "description": "Durable laptop bag with multiple compartments",
        "price": 49.99,
        "category": "Accessories",
        "stock": 40
    },
    {
        "name": "Smartphone",
        "description": "Latest smartphone with advanced camera features",
        "price": 699.99,
        "category": "Electronics",
        "stock": 15
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # Check if products already exist
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print("Database already seeded!")
            return
        
        # Add sample products
        for product_data in sample_products:
            product = Product(**product_data)
            db.add(product)
        
        db.commit()
        print("Database seeded successfully!")
    
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()