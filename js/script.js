/**
 * {
 *  id: string,
 *  title: string,
 *  author: string,
 *  genre: string,
 *  isReading: boolean,
 *  isFininshed: boolean,
 * }
 */
const books = [];

const RENDER_EVENT = 'render-books';
const localBooksKey = 'books';

function isStorageExists() {
	return typeof Storage !== null;
}

function generateId() {
	return Number(new Date());
}

function updateLocalStorage() {
	if (isStorageExists())
		localStorage.setItem(localBooksKey, JSON.stringify(books));
}

function createBookElement(book) {
	const { id, title, author, genre, isReading, isFinished } = book;

	const getActionButton = () => {
		if (isReading) {
			return '<button class="btn-primary" id="finish-btn">Tandai Sebagai Selesai</button>';
		} else if (isFinished) {
			return '<button class="btn-primary" id="return-btn">Kembalikan Buku</button>';
		} else {
			return `
      <button class="btn-primary" id="read-btn">Baca</button>
      <button class="btn-delete" id="delete-btn">Hapus</button>
      `;
		}
	};

	return `
  <div class="book-item" book-id="${id}">
    <div class="book-info">
      <h3>Judul</h3>
      <p>${title}</p>
      <h3>Pengarang</h3>
      <p>${author}</p>
      <h3>Genre</h3>
      <p>${genre}</p>
    </div>
    <div class="book-actions">
      ${getActionButton()}
    </div>
  </div>
  `;
}
function clearForm() {
	document.getElementById('title').value = '';
	document.getElementById('author').value = '';
	document.getElementById('genre').value = '';
}

function addBook() {
	const title = document.getElementById('title').value;
	const author = document.getElementById('author').value;
	const genre = document.getElementById('genre').value;

	const bookObject = {
		id: generateId(),
		title,
		author,
		genre,
		isReading: false,
		isFinished: false,
	};

	clearForm();
	books.push(bookObject);
	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

function deleteBook(bookElement) {
	const bookId = bookElement.getAttribute('book-id');

	const bookTarget = books.findIndex(book => book.id === Number(bookId));
	books.splice(bookTarget, 1);

	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

function setBookStatus(bookElement, state) {
	const bookId = bookElement.getAttribute('book-id');
	console.log(bookId);
	const bookTarget = books.findIndex(book => book.id === Number(bookId));
	if (bookTarget === -1) return;

	if (state === 'reading') {
		books[bookTarget].isReading = true;
	} else if (state === 'finished') {
		books[bookTarget].isReading = false;
		books[bookTarget].isFinished = true;
	} else if (state === 'return') {
		books[bookTarget].isReading = false;
		books[bookTarget].isFinished = false;
	}

	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', () => {
	if (isStorageExists()) {
		const localBooks = JSON.parse(localStorage.getItem(localBooksKey));
		if (localBooks === null)
			localStorage.setItem(localBooksKey, JSON.stringify([]));

		books.push(...localBooks);
		document.dispatchEvent(new CustomEvent(RENDER_EVENT));
	}

	const submitForm = document.getElementById('form');
	const bookList = document.getElementById('book-list');
	const readingList = document.getElementById('reading-list');
	const finishedList = document.getElementById('finished-list');

	submitForm.addEventListener('submit', e => {
		e.preventDefault();
		addBook();
	});

	bookList.addEventListener('click', e => {
		const that = e.target;
		if (that.id === 'read-btn') {
			setBookStatus(that.parentElement.parentElement, 'reading');
		} else if (that.id === 'delete-btn') {
			deleteBook(that.parentElement.parentElement);
		}
	});

	readingList.addEventListener('click', e => {
		const that = e.target;
		if (that.id === 'finish-btn')
			setBookStatus(that.parentElement.parentElement, 'finished');
	});

	finishedList.addEventListener('click', e => {
		const that = e.target;
		if (that.id === 'return-btn')
			setBookStatus(that.parentElement.parentElement, 'return');
	});
});

document.addEventListener(RENDER_EVENT, () => {
	const bookList = document.getElementById('book-list');
	const readingList = document.getElementById('reading-list');
	const finishedList = document.getElementById('finished-list');

	bookList.innerHTML = '';
	readingList.innerHTML = '';
	finishedList.innerHTML = '';

	for (const book of books) {
		const bookElement = createBookElement(book);
		if (book.isReading) {
			readingList.innerHTML += bookElement;
		} else if (book.isFinished) {
			finishedList.innerHTML += bookElement;
		} else {
			bookList.innerHTML += bookElement;
		}
	}

	updateLocalStorage();
});
