"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, getFilter } = require("../helpers/sql");

class Jobs {

    /** Create a new Job listing and return data for that listing
     * data should be {title, salary, equity, company_handle}
     * Return should be {title, salary, equity, company_handle}
     */
    static async create ({title, salary, equity, company_handle}){
        const result = await db.query(`
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES 
            ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle
        `, [title, salary, equity, company_handle])

        return result.rows[0];
    }

    static async findAll (){
       const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            ORDER BY title
            `)

        return result.rows[0]
    }

    static async get(id) {
        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1
        `, [id])
        return result[0]
    }

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

    static async remove(id){
        const result = await db.query(`
            DELETE 
            FROM jobs
            WHERE id = $1
            RETURNING id
        `)
        if(!result.rows[0]) throw new NotFoundError('No Job with that id was found')
    }
}