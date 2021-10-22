const express = require('express');
const morgan = require('morgan');
let items = require('./fakeDb');
const app = express();
const ExpressError = require('./expressError');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/items', (req, res, next) => {
    return res.json(items);
});

app.post('/items', (req, res, next) => {
    const item = req.body;
    if (item.name && item.price && Object.keys(item).length === 2) {
        items.push(item);
        return res.json({ added: item }, 201);
    } else {
        return next(new ExpressError('Error: item must contain name, price, and nothing else.', 400));
    }
});

app.get('/items/:name', (req, res, next) => {
    const item = items.filter(i => i.name == req.params.name);
    if (item.length != 0) return res.json(item[0]);
    return next(new ExpressError('Error: item not found', 404));
});

app.patch('/items/:name', (req, res, next) => {
    if (!(req.body.name || req.body.price)) {
        throw new ExpressError('Error: invalid patch data', 400);
    }
    try {
        const data = req.body;
        let i = 0, item;
        do {
            if (items[i].name == req.params.name) {
                item = items[i];
                for (key of Object.keys(data)) {
                    items[i][key] = data[key];
                }
            }
            i += 1;
        } while (i < items.length && items[i].name != req.params.name);
        if (item) return res.json({ updated: item });
        throw new ExpressError('Error: item not found', 404);
    } catch (err) {
        return next(err);
    }
    
});

app.delete('/items/:name', (req, res, next) => {
    try {
        let found = false;
        items = items.filter(i => {
            if (i.name == req.params.name) found = true;
            return i.name != req.params.name;
        });
        if (found) return res.json({ message: 'Deleted' });
        else return next(new ExpressError('Error: item to delete not found', 404));
    } catch (err) {
        return next(err);
    }
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message;
    console.error(message);
    return res.status(status).json({ error: { message, status } });
});

app.listen(3000, () => {
    console.log('app listening on localhost:3000');
});

module.exports = app;