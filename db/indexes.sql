-- Índice para búsqueda de libros por título y autor
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);

-- Índice para filtrar préstamos vencidos (due_at y returned_at)
CREATE INDEX idx_loans_due_at ON loans(due_at);
CREATE INDEX idx_loans_returned_at ON loans(returned_at);

-- Índice para FK más usadas
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_copies_book_id ON copies(book_id);
CREATE INDEX idx_fines_loan_id ON fines(loan_id);