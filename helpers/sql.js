const { BadRequestError } = require("../expressError");


// Handle all variables that need to be updated and
// create array for all values that are going to update the query

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // create an array with all keys from dataToUpdate
  const keys = Object.keys(dataToUpdate);
  //throw err if no keys are found
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //create an array of strings that are going to be eaqual to the keys folowed by $ and
  //index + 1 to be sql query ready
  const cols = keys.map((colName, idx) =>
    //avoid dublication betwean dataToUpdate and jsToSql
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // return a string for the SQL query and array of parameterizing values
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// Handle req.query and transform it in to DB Query and
// array of values for parameterizing
function getFilter(body){
  const {name, min, max} = body;
  let string = ''
  let arr = []
  // if min and max exsist and min is higher then max 
  //throw error
  if(min !== undefined && max !== undefined && min > max) {
    throw new BadRequestError('Minimum number of employees is higher then the Maximum')
  }
  //if name exsists create search parameter
  if(name !== undefined){
    string += ` name ILIKE $${arr.length + 1} `
    arr.push(`%${name}%`)
  }
  //if min exsists create search parameter
  if(min !== undefined){
    // if array is greater then 0 there is a previous query
    // and we are going to need AND
    if(arr.length > 0){
      string += 'AND '
    }
    string += ` num_employees > $${arr.length + 1} `
    arr.push(min)
  }
  //if max exsists create search parameter
  if(max !== undefined){
    // if array is greater then 0 there is a previous query
    // and we are going to need AND
    if(arr.length > 0){
      string += 'AND '
    }
    string += ` num_employees < $${arr.length + 1} `
    arr.push(max)
  }
  //return a string fore WHERE part in DB query
  // and array with all the values
  return{
    string,
    arr
  }
}

module.exports = { sqlForPartialUpdate, getFilter };
