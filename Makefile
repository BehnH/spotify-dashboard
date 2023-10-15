watch: watch-frontend & watch-backend

watch-frontend:
	echo "Watching frontend for changes"
	npm --prefix ./frontend run dev

watch-backend:
	echo "watching backend for changes"
	npm --prefix ./backend run watch