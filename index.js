const { Client } = require('pg');
const inquirer = require('inquirer');

// PostgreSQL client setup
const client = new Client({
  user: 'postgres',        
  host: 'localhost',       
  database: 'employee_tracker',  
  password: 'postgres',    
  port: 5433,              
});

// Connect to PostgreSQL
client.connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    start();  // Start the application only after the connection is established
  })
  .catch(err => console.error('Connection error', err.stack));

// Start function with Inquirer menu
function start() {
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ]
  }).then((answer) => {
    switch (answer.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        client.end();  
        console.log('Goodbye!');
        break;
    }
  });
}

// View Departments
function viewDepartments() {
  client.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.error('Error fetching departments:', err);
    } else {
      console.table(res.rows);
    }
    start();  // Restart the prompts after the operation
  });
}

// Add Department
function addDepartment() {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  }).then((answer) => {
    client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
      if (err) {
        console.error('Error inserting department:', err);
      } else {
        console.log(`Department ${answer.name} added!`);
      }
      start();  // Restart the prompts after the operation
    });
  });
}

// View Roles
function viewRoles() {
  client.query('SELECT * FROM role', (err, res) => {
    if (err) {
      console.error('Error fetching roles:', err);
    } else {
      console.table(res.rows);
    }
    start();  // Restart the prompts after the operation
  });
}

// Add Role
function addRole() {
  client.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.error('Error fetching departments for role:', err);
      start();
    } else {
      const departments = res.rows.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      inquirer.prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Enter the role title:'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Enter the salary:'
        },
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department:',
          choices: departments
        }
      ]).then((answers) => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
        client.query(query, [answers.title, answers.salary, answers.department_id], (err, res) => {
          if (err) {
            console.error('Error inserting role:', err);
          } else {
            console.log(`Role ${answers.title} added!`);
          }
          start(); 
        });
      });
    }
  });
}

// View Employees
function viewEmployees() {
  client.query('SELECT * FROM employees', (err, res) => {
    if (err) {
      console.error('Error fetching employees:', err);
    } else {
      console.table(res.rows);
    }
    start();  
  });
}

// Add Employee
function addEmployee() {
  client.query('SELECT * FROM role', (err, res) => {
    if (err) {
      console.error('Error fetching roles:', err);
      start();
    } else {
      const roles = res.rows.map(({ id, title }) => ({
        name: title,
        value: id
      }));

      client.query('SELECT * FROM employees', (err, res) => {
        if (err) {
          console.error('Error fetching employees for manager selection:', err);
          start();
        } else {
          const managers = res.rows.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
          }));

          inquirer.prompt([
            { name: 'first_name', type: 'input', message: "Enter the employee's first name:" },
            { name: 'last_name', type: 'input', message: "Enter the employee's last name:" },
            { name: 'role_id', type: 'list', message: "Select the employee's role:", choices: roles },
            { name: 'manager_id', type: 'list', message: "Select the employee's manager:", choices: managers }
          ]).then((answers) => {
            const query = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
            client.query(query, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (err, res) => {
              if (err) {
                console.error('Error inserting employee:', err);
              } else {
                console.log('Employee added!');
              }
              start(); 
            });
          });
        }
      });
    }
  });
}

// Update Employee Role (Placeholder)
function updateEmployeeRole() {
  console.log("Update employee role functionality not yet implemented.");
  start(); // Restart the prompt
}
