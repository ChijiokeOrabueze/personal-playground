import moment from 'moment';

// EMPLOYEE MATCHABILITY SCORE
// - Su has been previously assigned to me.
// - I am available within the time frame.
// - I have the desired skills.
// -- Number of su's I already have at hand. lesser su at hand, gets higer propability of being chosen.

// Top n matching employees are chosen for the task.
// n is the number of employees needed.

const employees = [
    {
        name: 'Mandy',
        role: 'care assistant',
        shift: {
            start: '08:00am',
            end: '12:00pm',
        },
    },
    {
        name: 'Mary',
        role: 'care assistant',
        shift: {
            start: '12:00pm',
            end: '06:00pm',
        },
    },
    {
        name: 'Star',
        role: 'nurse',
        shift: {
            start: '08:00am',
            end: '12:00pm',
        },
    },
];

const tasks = [
    {
        supportPersonel: 'care assistant',
        noSupportPersonel: 2,
        time: '09:00am',
        su: 'Jane smith',
    },
    {
        supportPersonel: 'nurse',
        noSupportPersonel: 2,
        time: '12:00pm',
        su: 'Jane smith',
    },
    {
        supportPersonel: 'care assistant',
        noSupportPersonel: 1,
        time: '04:00pm',
        su: 'Jane smith',
    },
    {
        supportPersonel: 'nurse',
        noSupportPersonel: 2,
        time: '02:24pm',
        su: 'Jane smith',
    },
    // {
    //     supportPersonel: 'care assistant',
    //     noSupportPersonel: 2,
    //     time: '09:00am',
    //     su: 'Mary Jane',
    // },
    // {
    //     supportPersonel: 'nurse',
    //     noSupportPersonel: 2,
    //     time: '12:00pm',
    //     su: 'Mary Jane',
    // },
    // {
    //     supportPersonel: 'care assistant',
    //     noSupportPersonel: 1,
    //     time: '04:00pm',
    //     su: 'Mary Jane',
    // },
    // {
    //     supportPersonel: 'nurse',
    //     noSupportPersonel: 2,
    //     time: '02:24pm',
    //     su: 'Mary Jane',
    // },
];

// const serviceUsers = [
//     {
//         name: 'Jane smith',
//         tasks: [
//             {
//                 supportPersonel: 'care assistant',
//                 noSupportPersonel: 2,
//                 time: '09:00am',
//             },
//             {
//                 supportPersonel: 'nurse',
//                 noSupportPersonel: 2,
//                 time: '12:00pm',
//             },
//             {
//                 supportPersonel: 'care assistant',
//                 noSupportPersonel: 1,
//                 time: '04:00pm',
//             },
//             {
//                 supportPersonel: 'nurse',
//                 noSupportPersonel: 2,
//                 time: '02:24pm',
//             },
//         ],
//     },
// ];

const suAndAssignedEmployees = {};

const employeeAndAssignedSu = {};

const employeeAndAssignedTasks = {};

tasks.forEach((task) => {
    let assignedEmployees = [];
    const prevAssignedEmployees = suAndAssignedEmployees[task.su] || [];

    employees.forEach((employee) => {
        let score = 0;
        const { role, shift, name } = employee;

        if (role === task.supportPersonel) {
            score++;
        }
        const empShiftStart = moment(shift.start, 'h:mma');
        const empShiftEnd = moment(shift.end, 'h:mma');

        const taskTime = moment(task.time, 'h:mma');

        if (taskTime.isSameOrAfter(empShiftStart) && taskTime.isBefore(empShiftEnd)) {
            score += 4;
        }

        if (prevAssignedEmployees.includes(name)) {
            score++;
        }

        const employeeToAdd = { employee, score };

        if (!assignedEmployees.length) {
            assignedEmployees.push(employeeToAdd);
        } else if (assignedEmployees.length < task.noSupportPersonel) {
            let indexToInsert;
            for (let i = 0; i < assignedEmployees.length; i++) {
                if (assignedEmployees[i].score >= score) {
                    indexToInsert = i;
                    break;
                }
            }

            if (indexToInsert) {
                assignedEmployees.splice(indexToInsert, 0, employeeToAdd);
            } else {
                assignedEmployees.push(employeeToAdd);
            }
        } else if (assignedEmployees[0].score === score) {
            const emp1AsignedLength = (
                employeeAndAssignedSu[assignedEmployees[0].employee.name] || []
            ).length;

            const emp2AsignedLength = (employeeAndAssignedSu[name] || []).length;

            if (emp1AsignedLength > emp2AsignedLength) {
                assignedEmployees[0] = employeeToAdd;
            }
        } else if (assignedEmployees[0].score < score) {
            assignedEmployees[0] = employeeToAdd;

            for (let i = 1; i < assignedEmployees.length; i++) {
                const emp1AsignedLength = (
                    employeeAndAssignedSu[assignedEmployees[i].employee.name] || []
                ).length;

                const emp2AsignedLength = (employeeAndAssignedSu[name] || []).length;

                if (
                    score > assignedEmployees[i].score ||
                    (score === assignedEmployees[i].score && emp1AsignedLength > emp2AsignedLength)
                ) {
                    const toMove = assignedEmployees[i];
                    assignedEmployees[i] = assignedEmployees[i - 1];
                    assignedEmployees[i - 1] = toMove;
                }
            }
        }
    });

    if (!suAndAssignedEmployees[task.su]) {
        suAndAssignedEmployees[task.su] = [];
    }

    assignedEmployees.forEach((assignedEmp) => {
        if (!suAndAssignedEmployees[task.su].includes(assignedEmp.employee.name)) {
            suAndAssignedEmployees[task.su].push(assignedEmp.employee.name);
        }

        if (!employeeAndAssignedSu[assignedEmp.employee.name]) {
            employeeAndAssignedSu[assignedEmp.employee.name] = [];
            employeeAndAssignedTasks[assignedEmp.employee.name] = [];
        }

        if (!employeeAndAssignedSu[assignedEmp.employee.name].includes(task.su)) {
            employeeAndAssignedSu[assignedEmp.employee.name].push(task.su);
        }
        employeeAndAssignedTasks[assignedEmp.employee.name].push(task);
    });
});

console.log({ employeeAndAssignedSu, suAndAssignedEmployees });

Object.entries(employeeAndAssignedTasks).forEach(([employee, tasks]) => {
    console.log(`\n`);
    console.log(`........................................`);
    console.log(`............ ${employee} ...............`);
    const target = employees.find((emp) => emp.name === employee);

    console.log(
        `${employee} is a ${target.role}. shift: ${target.shift.start} - ${target.shift.end}`,
    );
    console.log(`........................................`);
    console.log(`${employee} was assigned the following tasks:`);

    tasks.forEach((task) => {
        console.log(task);
    });
});
