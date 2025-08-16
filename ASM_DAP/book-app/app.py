from flask import Flask, render_template, request, redirect, url_for, abort
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId
from flask import flash
from models.user import User
from models.book import Book
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# MongoDB configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/bookdb"
mongo = PyMongo(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    try:
        user_data = mongo.db.users.find_one({"_id": ObjectId(user_id)})  # Sửa ở đây
        if not user_data:
            return None
        return User(user_data)
    except Exception as e:
        return None

# Routes
@app.route('/')
def home():
    stats = {
        'total_books': mongo.db.books.count_documents({}),
        'total_categories': len(mongo.db.books.distinct("category")),  # Sửa ở đây
        'total_users': mongo.db.users.count_documents({})
    }
    
    popular_categories = list(mongo.db.books.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]))
    
    recent_books = list(mongo.db.books.find().sort("_id", -1).limit(5))
    
    return render_template('home.html',
                         stats=stats,
                         popular_categories=popular_categories,
                         recent_books=recent_books)

@app.route('/about')
def about():
    stats = {
        'total_books': mongo.db.books.count_documents({}),
        'total_categories': len(mongo.db.books.distinct("category")),
        'total_users': mongo.db.users.count_documents({})
    }
    return render_template('about.html', stats=stats)

@app.route('/categories')
def categories():
    categories = []
    for category in mongo.db.books.distinct("category"):
        count = mongo.db.books.count_documents({"category": category})
        categories.append({
            "name": category,
            "count": count,
            "description": "Explore our collection of " + str(count) + " books"
        })
    return render_template('categories.html', categories=categories)

@app.route('/books/<category>')
def books(category):
    page = request.args.get('page', 1, type=int)
    per_page = 6
    search_query = request.args.get('search', '')
    
    query = {"category": category}
    if search_query:
        query["$or"] = [
            {"title": {"$regex": search_query, "$options": "i"}},
            {"author": {"$regex": search_query, "$options": "i"}}
        ]
    
    books = mongo.db.books.find(query).skip((page-1)*per_page).limit(per_page)
    total = mongo.db.books.count_documents(query)
    
    return render_template('books.html',
                          books=books,
                          category=category,
                          pagination={
                              'page': page,
                              'per_page': per_page,
                              'total': total,
                              'pages': (total // per_page) + 1
                          },
                          search_query=search_query)

@app.route('/book/<book_id>')
def book_detail(book_id):
    try:
        book = mongo.db.books.find_one_or_404({"_id": ObjectId(book_id)})
        return render_template('book_detail.html', book=book)
    except Exception as e:
        return str(e), 404

@app.route('/borrow/<book_id>')
@login_required
def borrow_book(book_id):
    try:
        # Chuyển user.id sang string để so khớp
        mongo.db.books.update_one(
            {"_id": ObjectId(book_id)},
            {"$addToSet": {"borrowed_by": str(current_user.id)}}
        )
        return redirect(url_for('book_detail', book_id=book_id))
    except Exception as e:
        flash('Error borrowing book', 'danger')
        return redirect(url_for('book_detail', book_id=book_id))

@app.route('/return/<book_id>')
@login_required
def return_book(book_id):
    try:
        mongo.db.books.update_one(
            {"_id": ObjectId(book_id)},
            {"$pull": {"borrowed_by": str(current_user.id)}}
        )
        return redirect(url_for('book_detail', book_id=book_id))
    except Exception as e:
        flash('Error returning book', 'danger')
        return redirect(url_for('book_detail', book_id=book_id))

# Auth routes
# Xử lý chuyển hướng sau login
@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_data = mongo.db.users.find_one({"email": email})
        
        if user_data and check_password_hash(user_data['password'], password):
            user = User(user_data)
            login_user(user)
            flash('Login successful!', 'success')  
            if user.role == 'admin': #Nếu là admin thì điều hướng đến dashboard
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('home')) #Nếu không thì về home
        
        flash('Invalid email or password', 'danger')
        return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = generate_password_hash(request.form.get('password'))
        
        if not name or not email or not password:
            flash('All fields are required', 'danger')
            return redirect(url_for('register'))
            
        if mongo.db.users.find_one({"email": email}):
            flash('Email already exists', 'danger')
            return redirect(url_for('register'))
            
        mongo.db.users.insert_one({
            "name": name,  # Đã sửa
            "email": email,
            "password": password,
            "role": "user"
        })
        flash('Registration successful! Please login', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)

@app.template_filter('date_format')
def date_format_filter(value, format="%d/%m/%Y"):
    if isinstance(value, datetime):
        return value.strftime(format)
    return value

@app.template_filter('truncate')
def truncate_filter(text, length=100):
    if len(text) <= length:
        return text
    return text[:length] + '...'

@app.context_processor
def inject_mongo():
    return dict(mongo=mongo)

#Decorator để phân quyền admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

# Admin routes
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    return render_template('admin/dashboard.html')

@app.route('/admin/users')
@admin_required
def admin_users():
    users = list(mongo.db.users.find())
    return render_template('admin/users.html', users=users)

@app.route('/admin/books')
@admin_required
def admin_books():
    books = list(mongo.db.books.find())
    return render_template('admin/books.html', books=books)

# Admin Book CRUD
@app.route('/admin/books/add', methods=['GET', 'POST'])
@admin_required
def admin_add_book():
    if request.method == 'POST':
        new_book = {
            "title": request.form.get('title'),
            "author": request.form.get('author'),
            "category": request.form.get('category'),
            "description": request.form.get('description'),
            "published_date": datetime.now(),
            "borrowed_by": []
        }
        mongo.db.books.insert_one(new_book)
        flash('Book added successfully', 'success')
        return redirect(url_for('admin_books'))
    return render_template('admin/add_book.html')

@app.route('/admin/books/edit/<book_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_book(book_id):
    book = mongo.db.books.find_one({"_id": ObjectId(book_id)})
    if request.method == 'POST':
        updates = {
            "$set": {
                "title": request.form.get('title'),
                "author": request.form.get('author'),
                "category": request.form.get('category'),
                "description": request.form.get('description')
            }
        }
        mongo.db.books.update_one({"_id": ObjectId(book_id)}, updates)
        flash('Book updated successfully', 'success')
        return redirect(url_for('admin_books'))
    return render_template('admin/edit_book.html', book=book)

@app.route('/admin/books/delete/<book_id>')
@admin_required
def admin_delete_book(book_id):
    mongo.db.books.delete_one({"_id": ObjectId(book_id)})
    flash('Book deleted successfully', 'success')
    return redirect(url_for('admin_books'))

# Admin User CRUD
@app.route('/admin/users/edit/<user_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_user(user_id):
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        
        if request.method == 'POST':
            updates = {
                "$set": {
                    "name": request.form.get('name'),
                    "email": request.form.get('email'),
                    "role": request.form.get('role')
                }
            }
            mongo.db.users.update_one({"_id": ObjectId(user_id)}, updates)
            flash('User updated successfully', 'success')
            return redirect(url_for('admin_users'))
            
        return render_template('admin/edit_user.html', user=user)
    except Exception as e:
        flash('Error updating user', 'danger')
        return redirect(url_for('admin_users'))

@app.route('/admin/users/delete/<user_id>')
@admin_required
def admin_delete_user(user_id):
    try:
        mongo.db.users.delete_one({"_id": ObjectId(user_id)})
        flash('User deleted successfully', 'success')
        return redirect(url_for('admin_users'))
    except Exception as e:
        flash('Error deleting user', 'danger')
        return redirect(url_for('admin_users'))
