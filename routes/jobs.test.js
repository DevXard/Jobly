"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /Jobs */

describe("POST /jobs",  () => {
    const newJob = {
      title: "new",
      salary: 70000,
      equity: 0,
      company_handle: "c3"
    };
  
    test("POST new job", async () => {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
          job: {
            id: expect.any(Number),
            title: "new",
            salary: 70000,
            equity: '0',
            company_handle: "c3"
          }
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: 71000,
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: 70000,
                equity: '0',
                company_handle: "c3"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
      });
});

/************************************** GET /companies */

describe("GET /jobs",  () => {
    test("should get all jobs", async function () {
      const res = await request(app).get("/jobs");
      
      expect(res.body).toEqual({
        jobs: [
            {
              id: expect.any(Number),
              title: 'Engeneer',
              salary: 65000,
              equity: '0',
              company_handle: 'c3'
            },
            {
              id: expect.any(Number),
              title: 'Photographer',
              salary: 70000,
              equity: '0',
              company_handle: 'c1'
            },
            {
              id: expect.any(Number),
              title: 'Banker',
              salary: 85000,
              equity: '0',
              company_handle: 'c2'
            }
          ]
      });
    });
});

/************************************** GET /job/:id */

describe("GET /jobs/:id",  () => {
    const newJob = {
        title: "new",
        salary: 70000,
        equity: 0,
        company_handle: "c3"
      };
    test("should get job by id", async () => {
      const job = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);

      const res = await request(app)
      .get(`/jobs/${job.body.job.id}`)
      .set("authorization", `Bearer ${u1Token}`);
      expect(res.body).toEqual({
        job: {
            title: "new",
            salary: 70000,
            equity: '0',
            company_handle: "c3"
        },
      });
    });
  
    test("not found for no such job", async  () => {
      const res = await request(app)
      .get(`/jobs/0`)
      .set("authorization", `Bearer ${u1Token}`);;
      expect(res.statusCode).toEqual(404);
    });
  });

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", () =>{
    const newJob = {
        title: "new",
        salary: 70000,
        equity: 0,
        company_handle: "c3"
      };
    test("should update job", async () => {
      const job = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      const res = await request(app)
          .patch(`/jobs/${job.body.job.id}`)
          .send({
            title: "NewNew",
            salary: 910000
          })
          .set("authorization", `Bearer ${u2Token}`);

      expect(res.body).toEqual({
        job: {
            title: "NewNew",
            salary: 910000,
            equity: "0",
            company_handle: "c3"
        },
      });
    });
  
    test("fail unouthorized", async () =>{
        const job = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      const res = await request(app)
          .patch(`/jobs/${job.body.job.id}`)
          .send({
            title: "old-new",
          });
      expect(res.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async  () =>{
      const res = await request(app)
          .patch(`/jobs/0`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(res.statusCode).toEqual(404);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", () =>{
    const newJob = {
        title: "new",
        salary: 70000,
        equity: 0,
        company_handle: "c3"
      };
    test("should delete a job", async () => {
        const job = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      const res = await request(app)
          .delete(`/jobs/${job.body.job.id}`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(res.body).toEqual({ msg: "DELETED" });
    });
  
    test("Unauthorized ", async  () => {
        const job = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      const res = await request(app)
          .delete(`/jobs/${job.body.job.id}`);
      expect(res.statusCode).toEqual(401);
    });
  
    test("not found no such job", async  () =>{
      const res = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(res.statusCode).toEqual(404);
    });
  });