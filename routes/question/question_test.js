
/**
 * @jest-environment node
 */
jest.setTimeout(60000);
global.console = {
    log: jest.fn(),
    error: jest.fn()
}

const axios = require('axios');
const {to} = require('await-to-js');


describe("Question API test", async () => {
    const app = require('../../../app');
    const service = axios.create({
        auth: {
          username: global.conf.authentication.admin.username,
          password: global.conf.authentication.admin.password
        }
      });
    const path = "http://localhost:"+ global.conf.listenPort +"/api/v1.0/question";
    let question_id = "";
    throw new Error("Not implemented entity model");
    // const question = {
    //     name: "john doe",
    //     email: "john.doe@email.com",
    //     age: 34
    // };
    
    afterAll(async done => {
        app.express_server.close();
        done();
    });

    test("POST /question", async done => {
        const [err, result] = await to(service.post(path, question));   
        
        expect(err).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data.status).toBe("created");
        expect(result.data.entity).toBe("question");
        expect(result.data.id).not.toBeNull();
        question_id = result.data.id;
        done();
    });


    test("GET /question:id", async done => {        
        const [err, result] = await to(service.get(`${ path }/${question_id}`));        
        expect(err).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data).not.toBeNull();
        expect(result.data.id).toBe(question_id)
        throw new Error("Not implemented read fields");
        done();
    });

    test("PUT /question:id", async done => {
        throw new Error("Not implemented update fields");        
        // question.name = "jane doe";
        // question.email = "jane.doe@email.com";
        // question.age = 32;
        

        const [err, result] = await to(service.put(`${path}/${question_id}`, question));   
        expect(err).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data).not.toBeNull();
        expect(result.data.entity).toBe("question");
        expect(result.data.id).toBe(question_id);
        expect(result.data.status).toBe("updated");
        done();
    });

    test("DELETE /question:id", async done => {
        const [err, result] = await to(service.delete(`${path}/${question_id}`));
        expect(err).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data).not.toBeNull();
        expect(result.data.entity).toBe("question");
        expect(result.data.id).toBe(question_id);
        expect(result.data.status).toBe("deleted");
        done();
    });
});
