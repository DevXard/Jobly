"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Jobs = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("Create new Job Posting", () =>{
    const jobPost = {
        title: 'Technical brewer',
        salary: 77000,
        equity: "0",
        company_handle: 'c2'
    }
    test("Create a new Job Posting", async () => {
        const job = await Jobs.create(jobPost)
        expect(typeof job.id).toEqual('number')
        expect(job.title).toEqual('Technical brewer')
        expect(job.salary).toEqual(77000,)
        
        
        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'Technical brewer'
        `)
        expect(result.rows[0]).toEqual(jobPost)
    })
})

describe("FindAll Job postings", () => { 
    test('Shoud get all job posts', async () => {
        const jobs = await Jobs.findAll();
        
        expect(jobs).toEqual([
            {
              title: 'Conservator, furniture',
              salary: 110000,
              equity: '0',
              company_handle: 'c1'
            },
            {
              title: 'Information officer',
              salary: 200000,
              equity: '0',
              company_handle: 'c1'
            },
            {
              title: 'Consulting civil engineer',
              salary: 60000,
              equity: '0',
              company_handle: 'c1'
            }
          ])
    })
})

describe("Get individual job posts", () => {
    const jobPost = {
        title: 'Technical brewer',
        salary: 77000,
        equity: "0",
        company_handle: 'c2'
    }
    test('Shoud get single job posts', async () => {
        const job = await Jobs.create(jobPost)
        const getJob = await Jobs.get(job.id)
        expect(getJob).toEqual(jobPost)
    })

    test("not found if no such company", async function () {
        try {
          await Jobs.get(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
})

describe("UPDATE  job posts", () => {
    const jobPost = {
        title: 'Technical brewer',
        salary: 77000,
        equity: "0",
        company_handle: 'c2'
    }
    test('Shoud get single job posts', async () => {
        const job = await Jobs.create(jobPost)
        const getJob = await Jobs.update(job.id, {
            title: 'Engeneer',
            salary: 90000,
            equity: "0",
            company_handle: 'c3'
        })
        expect(getJob.title).toEqual('Engeneer')
        expect(getJob.salary).toEqual(90000)
        expect(getJob.company_handle).toEqual('c3')
    })

    test("not found if no such company", async function () {
        try {
          await Jobs.update(0,{
            title: 'Engeneer',
            salary: 90000,
            equity: "0",
            company_handle: 'c3'
        });
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
})

describe("Get individual job posts", () => {
    const jobPost = {
        title: 'Technical brewer',
        salary: 77000,
        equity: "0",
        company_handle: 'c2'
    }
    test('Shoud get single job posts', async () => {
        const job = await Jobs.create(jobPost)
        const getJob = await Jobs.remove(job.id)
        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE id = ${job.id}
        `)
        expect(result.rows.length).toEqual(0);
    })

    test("not found if no such company", async function () {
        try {
          await Jobs.get(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
})