const process = require('process');
process.env.NODE_ENV = 'test';
const app = require('./router');
const request = require('supertest');
let items = require('./fakeDb');
let brownie = { name: 'brownie', price: 3.00 };

app.listen(3000, () => {
    console.log('Test Server starting on port 3000');
});

beforeEach(() => {
    items.push(brownie);
});

afterEach(() => {
    items.length = 0;
});

describe('GET /items', () => {

    test('gets list of all items', async () => {
        const resp = await request(app).get('/items');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual([{name: 'brownie', price: 3.00}]);
    });

});

describe('POST /items', () => {

    test('creates new item and adds to database', async () => {
        const item = {name: 'popsicle', price: 2.75};
        const resp = await request(app)
            .post('/items')
            .send(item);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({ added: item });
        expect(items.length).toBe(2);
    });

    test('returns error if item does not have exactly two attributes', async () => {
        const resp = await request(app)
            .post('/items')
            .send({ name: 'blondie' });

        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: item must contain name, price, and nothing else.',
                status: 400
            }
        });
    });

    test('returns error if item has two attributes, but no name', async () => {
        const resp = await request(app)
            .post('/items')
            .send({ category: 'dessert', price: 5.00 });

        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: item must contain name, price, and nothing else.',
                status: 400
            }
        });
    });

});

describe('GET /items/:name', () => {
    
    test('get item by name', async () => {
        const resp = await request(app).get(`/items/${brownie.name}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual(brownie);
    });

    test('get item that does not exist in database', async () => {
        const resp = await request(app).get('/items/blablabla');
        expect(resp.statusCode).toBe(404);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: item not found',
                status: 404
            }
        })
    });

});

describe('PATCH /items/:name', () => {

    test('updates item name and price', async () => {
        const blondie = { name: 'blondie', price: 4.00 };
        const resp = await request(app)
            .patch(`/items/${brownie.name}`)
            .send(blondie);
        
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ updated : blondie });
    });

    test('updates item name', async () => {
        const resp = await request(app)
            .patch(`/items/${brownie.name}`)
            .send({ name: 'blondie' });
        
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            updated: {
                name: 'blondie',
                price: brownie.price 
            }
        });
    });

    test('updates item price', async () => {
        const resp = await request(app)
            .patch(`/items/${brownie.name}`)
            .send({ price: 4.00 });
        
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            updated: {
                name: brownie.name,
                price: 4.00
            }
        });
    });

    test('returns error if item does not exist in database', async () => {
        const resp = await request(app)
            .patch('/items/blablabla')
            .send({ price: 4.00 });

        expect(resp.statusCode).toBe(404);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: item not found',
                status: 404
            }
        });
    });

    test('returns error if update data neither contains name nor price', async () => {
        const resp = await request(app)
            .patch(`/items/${brownie.name}`)
            .send({});
        
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: invalid patch data',
                status: 400
            }
        });
    });
});

describe('DELETE /items/:name', () => {

    test('deletes item from database', async () => {
        const resp = await request(app)
            .delete(`/items/${brownie.name}`);
        
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ message: 'Deleted' });
    });

    test('returns error if attempting to delete item that does not exist in database', async () => {
        const resp = await request(app)
            .delete('/items/blablabla');
            
        expect(resp.statusCode).toBe(404);
        expect(resp.body).toEqual({
            error: {
                message: 'Error: item to delete not found',
                status: 404
            }
        });
    });

});