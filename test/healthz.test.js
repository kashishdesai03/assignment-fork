const request = require("supertest");
const app = require("../app");
// const app = require("../app"); // Adjust the path based on your project structure

// global.app = app;
// global.request = request;
describe("Health Check API", () => {
  // it("should respond with status 200", async () => {
  //   const response = await request(app).get("/healthz");
  //   expect(response.status).toBe(200);
  it("should respond with status 200", async () => {
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});
