"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureLoggedInAndAdminOrUser } = require("../middleware/auth");
const Jobs = require("../models/jobs");

const jobsNewSchema = require("../schemas/jobsNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/**GET
 * { jobs: [id, title, salary, equity, company_handle]}
 * 
 * Authorization required: login
 */
 
router.get("/", async (req, res, next) => {
    try{
        if(Object.keys(req.query).length === 0){
            const jobs = await Jobs.findAll()
            return res.json({jobs})
          }
        const jobs = await Jobs.getWithFilter(req.query)
        return res.json({jobs})
    }catch(err) {
        return next(err);
    }
})

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobsNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Jobs.create(req.body)
        return res.status(201).json({job})
    }catch(err) {
        return next(err);
    }
})

/** GET /[id]  =>  { job }
 *
 *  Job is { title, salary, equity, company_handle }
 *   where jobs is[{ id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try{
        
        const job = await Jobs.get(req.params.id)
        return res.json({job})
    }catch(err) {
        return next(err);
    }
})

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.patch("/:id", ensureLoggedInAndAdminOrUser, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Jobs.update(req.params.id, req.body)
        return res.json({job})
    }catch(err) {
        return next(err);
    }
})

/** DELETE /[id]  =>  { msg: DELETED }
 *
 * Authorization: login 
 */
router.delete('/:id', ensureLoggedInAndAdminOrUser, async(req, res, next) => {
    try{
        const job = await Jobs.remove(req.params.id)
        return res.json({msg: "DELETED"})
    }catch (err) {
        return next(err);
    }
})

module.exports = router;