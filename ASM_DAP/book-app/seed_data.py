import pymongo
from datetime import datetime
from werkzeug.security import generate_password_hash

# Kết nối MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["bookdb"]

# Xóa dữ liệu cũ (nếu cần)
db.users.delete_many({})
db.books.delete_many({})

# Thêm users
users_data = [
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": generate_password_hash("password123"),
        "role": "user"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password": generate_password_hash("securepass"),
        "role": "user"
    },
    {
        "name": "Admin User",
        "email": "admin@example.com",
        "password": generate_password_hash("adminpass"),
        "role": "admin"  # Role admin
    }
]
users = db.users.insert_many(users_data)
user_ids = users.inserted_ids

# Thêm books
books_data = [
    {
        "title": "The Python Handbook",
        "author": "Flavio Copes",
        "category": "Programming",
        "description": "Learn Python programming basics quickly with this comprehensive guide.",
        "published_date": datetime(2020, 1, 1),  # Đã sửa ở đây
        "borrowed_by": []
    },
    {
        "title": "Fluent Python",
        "author": "Luciano Ramalho",
        "category": "Programming",
        "description": "Learn how to write effective Python code using Python's best features.",
        "published_date": datetime(2021, 1, 1),  # Đã sửa
        "borrowed_by": [user_ids[0]]
    },
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "category": "Classic Literature",
        "description": "A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.",
        "published_date": datetime(2022, 1, 1),  # Đã sửa
        "borrowed_by": []
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "category": "Dystopian",
        "description": "A dystopian social science fiction novel and cautionary tale.",
        "published_date": datetime(2023, 1, 1),  # Đã sửa
        "borrowed_by": [user_ids[1]]
    },
    {
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "category": "History",
        "description": "Explore the history of humankind from the evolution of Homo sapiens.",
        "published_date": datetime(2024, 1, 1),  # Đã sửa
        "borrowed_by": []
    },
    {
        "title": "The Lean Startup",
        "author": "Eric Ries",
        "category": "Business",
        "description": "Learn how to create and manage successful startups.",
        "published_date": datetime(2025, 1, 1),  # Đã sửa
        "borrowed_by": [user_ids[0], user_ids[2]]
    }
]
db.books.insert_many(books_data)

print("Dữ liệu mẫu đã được thêm thành công!")
print(f"- Đã thêm {len(users_data)} users")
print(f"- Đã thêm {len(books_data)} books")