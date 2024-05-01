const express = require('express');
const pageRouter = require('./server/routes/pagerouter');
const app = express();
const path = require('path');
const pug = require('pug');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/rockpaperscissors', pageRouter);


app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});