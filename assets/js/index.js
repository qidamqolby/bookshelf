// define variables
const bookshelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookshelf-apps';

const inputForm = document.getElementById('input-book');
const inputTitle = document.getElementById('input-title');
const inputAuthor = document.getElementById('input-author');
const inputYear = document.getElementById('input-year');
const inputCompleted = document.getElementById('input-completed');
const searchForm = document.getElementById('search-book');
const searchTitle = document.getElementById('search-title');

// main function
document.addEventListener('DOMContentLoaded', function () {
    inputForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        modalAlert('Bookshelf has been updated');
        inputForm.reset();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

// add new book
function addBook() {
    const id = generateId();
    const bookTitle = inputTitle.value;
    const bookAuthor = inputAuthor.value;
    const bookYear = inputYear.value;
    const isCompleted = inputCompleted.checked;

    const book = { id, bookTitle, bookAuthor, bookYear, isCompleted };

    bookshelf.push(book);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// search book
function searchBook() {
    const searchTarget = findBookTitle(searchTitle.value);
    const showBook = document.getElementsByClassName('book-item');

    for (const index in showBook) {
        if (searchTarget !== parseInt(showBook[index].id)) {
            showBook[index].style.display = 'none';
        }
    }
}

// displaying bookshelf
document.addEventListener(RENDER_EVENT, function () {
    const incompletedList = document.getElementById('incomplete-booklist');
    const completedList = document.getElementById('complete-booklist');

    incompletedList.innerHTML = '';
    completedList.innerHTML = '';

    for (const book of bookshelf) {
        const bookElement = booklist(book);
        if (book.isCompleted) {
            completedList.append(bookElement);
        } else {
            incompletedList.append(bookElement);
        }
    }
});

function booklist(book) {
    const { id, bookTitle, bookAuthor, bookYear, isCompleted } = book;

    const bookArticle = document.createElement('article');
    bookArticle.classList.add('book-item');
    bookArticle.setAttribute('id', `${id}`);
    bookArticle.innerHTML = `
    <div class="book-content">
        <h3>${bookTitle}</h3>
        <p>Author: ${bookAuthor}</p>
        <p>Published: ${bookYear}</p>
    </div>
    `;

    const bookAction = document.createElement('div');
    bookAction.classList.add('action');

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-delete');
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.addEventListener('click', function () {
        deleteBook(id);
    });

    if (isCompleted) {
        const undoBtn = document.createElement('button');
        undoBtn.classList.add('btn', 'btn-primary');
        undoBtn.innerHTML = `<i class="fas fa-rotate-left"></i>`;
        undoBtn.addEventListener('click', function () {
            undoBook(id);
        });

        bookAction.append(undoBtn, deleteBtn);
    } else {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('btn', 'btn-primary');
        checkBtn.innerHTML = `<i class="fas fa-check"></i>`;
        checkBtn.addEventListener('click', function () {
            checkBook(id);
        });

        bookAction.append(checkBtn, deleteBtn);
    }

    bookArticle.append(bookAction);

    return bookArticle;
}

// function check, undo and delete
function checkBook(bookId) {
    const bookTarget = findBookId(bookId);

    if (bookTarget === null) {
        return;
    }

    modalConfirm('Have you finished reading?').then((confirmed) => {
        if (confirmed) {
            bookTarget.isCompleted = true;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            window.location.reload();
        }
    });
}

function undoBook(bookId) {
    const bookTarget = findBookId(bookId);

    if (bookTarget === null) {
        return;
    }

    modalConfirm('Do you want to read this book again?').then((confirmed) => {
        if (confirmed) {
            bookTarget.isCompleted = false;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            window.location.reload();
        }
    });
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) {
        return;
    }

    modalConfirm('Do you want to delete this book?').then((confirmed) => {
        if (confirmed) {
            bookshelf.splice(bookTarget, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            window.location.reload();
        }
    });
}

// local storage
function isStorageExist() {
    if (typeof Storage === undefined) {
        modalAlert("Your browser don't support this apps");
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const localData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(localData);

    if (data !== null) {
        for (const book of data) {
            bookshelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// addtional function
function generateId() {
    return +new Date();
}

function findBookId(bookId) {
    for (const book of bookshelf) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in bookshelf) {
        if (bookshelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function findBookTitle(str) {
    for (const index in bookshelf) {
        if (bookshelf[index].bookTitle.includes(str) === true) {
            return bookshelf[index].id;
        }
    }
    return null;
}

function modalConfirm(text) {
    return new Promise((resolve) => {
        const modalHtml = `
            <div class="modal">
                <div class="modal-content">
                    <p>${text}</p>
                    <button id="confirmBtn" class="btn btn-primary">Confirm</button>
                    <button id="cancelBtn" class="btn btn-delete">Cancel</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.querySelector('.modal');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        confirmBtn.addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}

function modalAlert(text) {
    return new Promise((resolve) => {
        const modalHtml = `
            <div class="modal">
                <div class="modal-content">
                    <p>${text}</p>
                    <button id="confirmBtn" class="btn btn-primary">Close</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.querySelector('.modal');
        const confirmBtn = document.getElementById('confirmBtn');

        confirmBtn.addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        setTimeout(() => {
            modal.remove();
            resolve(true);
        }, 3000);
    });
}
