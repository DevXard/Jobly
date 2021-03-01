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
function getFilter(obj){
  
  const valueNames = Object.keys(obj)
  let arr = []
  valueNames.forEach((val, index) => {
    if(val === "title" || val === "name" || val === "company_handle"){
      arr.push(`${val} ILIKE $${index + 1}`)
    }
    if(val === "salary"){
      arr.push(`${val} > $${index + 1}`)
    }
    if(val === "equity"){
      arr.push(`${val} >= $${index + 1}`)
    }
    if(val === "max"){
      arr.push(`num_employees < $${index + 1}`)
    }
    if(val === "min"){
      arr.push(`num_employees > $${index + 1}`)
    }

  })

  return {
    str: arr.join(" AND "),
    values: Object.values(obj)
  }
}


module.exports = { sqlForPartialUpdate, getFilter };
