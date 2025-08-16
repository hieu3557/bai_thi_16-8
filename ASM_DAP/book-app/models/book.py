class Book:
    def __init__(self, book_data):
        self.id = str(book_data['_id'])
        self.title = book_data['title']
        self.author = book_data['author']
        self.category = book_data['category']
        self.description = book_data.get('description', '')
        self.borrowed_by = book_data.get('borrowed_by', [])