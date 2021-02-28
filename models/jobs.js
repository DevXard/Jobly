"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, getFilter } = require("../helpers/sql");

class Jobs {

    /** Create a new Job listing and return data for that listing
     * data should be {title, salary, equity, company_handle}
     * Return should be {title, salary, equity, company_handle}
     */
    static async create (body){
        const {title, salary, equity, company_handle} = body;
        
        const result = await db.query(`
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES 
            ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle
        `, [title, salary, equity, company_handle])
        
        return result.rows[0];
    }

    // get all jobs 
    // returns array with all jobs
    static async findAll (){
       const result = await db.query(`
            SELECT id, title, salary, equity, company_handle
            FROM jobs
            `)

        return result.rows
    }

    //get job by id return [title, salary, equity, company_handle]
    // if not found throw  NotFoundError
    static async get(id) {
        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1
        `, [id])
        if(!result.rows[0]) throw new NotFoundError('Job not found')
        
        return result.rows[0]
    }

    // UPDATE a specific job returns new data
    // bodyData [title, salary, equity, company_handle]
    // returns new [title, salary, equity, company_handle]
    // if the job is not found throw  NotFoundError
    static async update(id, bodyData){
        const { setCols, values } = sqlForPartialUpdate(
            bodyData,
            {});
        let idIndex = "$" + (values.length + 1);

        const queryString = `
            UPDATE jobs
            SET ${setCols}
            WHERE id = ${idIndex}
            RETURNING title, salary, equity, company_handle
        `
        const result = await db.query(queryString, [...values, id])

        if(!result.rows[0]) throw new NotFoundError('Job does not exsist')

        return result.rows[0]
    }

    // DELETE a specific job and return undefined
    // if companie does not exist throw new NotFoundError
    static async remove(id){
        const result = await db.query(`
            DELETE 
            FROM jobs
            WHERE id = $1
            RETURNING id
        `, [id])
        if(!result.rows[0]) throw new NotFoundError('No Job with that id was found')
    }
}

module.exports = Jobs;