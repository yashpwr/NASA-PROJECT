const request = require('supertest');
const app = require('../../app');

const { mongoConnect, mongoDisconnect } = require('../../services/mongo')


describe('Launches API',() => {

    beforeAll( async() => {
        await mongoConnect();
    });

    afterAll( async() => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should respond with 200 success ', async () => {
          const response = await request(app)
          .get('/lauches')
        //   .expect('Content-Type', /json/)
          .expect(200);
        });
    });
    
    describe('Test POST /launches', () => {
    
        const completeLaunchData = {
            mission: 'Kepler Xploration X',
            rocket: 'Explorer IS1',
            target: 'Keplar-442 b',
            launchDate: 'December 27, 2030',
        }
    
        const launchDataWithoutDate = {
            mission: 'Kepler Xploration X',
            rocket: 'Explorer IS1',
            target: 'Keplar-442 b',
        }
    
        const launchDataWithInvalidDate = {
            mission: 'Kepler Xploration X',
            rocket: 'Explorer IS1',
            target: 'Keplar-442 b',
            launchDate: 'foooo',
        }
    
        test('It should respond with 200 success ', async () => {
            const response = await request(app)
            .post('/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
        
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
                expect(response.body).toStrictEqual({
                    error: "Missing required lauch property"
                });
        });
        
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
                expect(response.body).toStrictEqual({
                    error: "Invalid lauch date"
                });
        });
    
    
    });
});

