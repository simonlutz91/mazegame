const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;


//config variables
const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 15;
const cellsVertical = 10;

const unitLenght = width / cellsHorizontal;
const unitHeight = height / cellsVertical;
// const vertical = 3;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height,
        showVelocity: false,
        
    }
});

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 5, height, { isStatic: true })
];

Render.run(render);
Runner.run(Runner.create(), engine);

World.add(world, walls)



//maze generation

const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter)

        counter--;
        const temp = arr[counter]
        arr[counter] = arr[index]
        arr[index] = temp;
    }
    return arr
};

const grid = Array(cellsVertical).fill().map(() => Array(cellsHorizontal).fill(false))

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false))
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false))

const startRow = Math.floor(Math.random() * cellsVertical); 
const startColumn = Math.floor(Math.random() * cellsHorizontal);

//iterating through maze
const stepThroughCell = (row, column) => {
    //if i had visited the cell at [row, column] then return
    if (grid[row][column]) {
        return;
    }
    //mark this cell as being visited
    grid[row][column] = true;
    //assemble randomly ordered list of neighbours
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column - 1, 'left'],
        [row + 1, column, 'down'],
        [row, column + 1, 'right']
    ]);
    
    //for each neighbour...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor
    
    //if that neighbour is out of bounds
    if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
        continue; //The continue statement "jumps over" one iteration in the loop.
    }
    //if we have visited that neighbour continue to next neighbour
    if (grid[nextRow][nextColumn]){
        continue;
    }
    //remove wall from either horizontal or vertical array
    if (direction === 'left'){
        verticals[row][column - 1] = true
    }
    else if (direction === 'right'){
        verticals[row][column] = true
    }
    else if (direction === 'up'){
        horizontals[row - 1][column] = true
    }
    else if (direction === 'down'){
        horizontals[row][column] = true
    }
    stepThroughCell(nextRow, nextColumn);
}


    //visit that next cell
}

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenght + unitLenght / 2,
            rowIndex * unitHeight + unitHeight,
            unitLenght,
            10,
            {
                isStatic: true,
                label: 'wall',
                render: {fillStyle: '#B22222'}
            }
        );
        World.add(world, wall)
    })
});

verticals.forEach((row, rowIndex) =>{
    row.forEach((open, columnIndex) => {
        if (open){
            return
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLenght + unitLenght,
            rowIndex * unitHeight + unitHeight / 2,
            10,
            unitHeight,
            {
                isStatic: true,
                label: 'wall',
                render: {fillStyle: '#B22222'}
            }
        )
        World.add(world, wall)
    })
})

const goal = Bodies.rectangle(
    width - unitLenght / 2, height - unitHeight / 2, unitLenght * .7, unitHeight * .7,
    {isStatic: true, label: 'goal', 
    render: {fillStyle: '#24fe41'}
    }
);

World.add(world, goal);

const ballRadius = Math.min(unitLenght, unitHeight) / 4
const ball = Bodies.circle(
    unitLenght / 2, unitHeight /2, ballRadius, {isStatic: false, label: 'bolle', render: { fillStyle: '#fdfc47' }}
    );

World.add(world, ball)

document.addEventListener('keydown', event => {
    const {x, y} = ball.velocity;
    if (event.key === 'w'){
       Body.setVelocity(ball, {x, y: y - 5})
       
    }
    else if (event.key === 'd'){
        Body.setVelocity(ball, {x: x + 5, y})
    }
    else if (event.key === 'a') {
        Body.setVelocity(ball, {x: x - 5, y})
    }
    else if (event.key === 's') {
        Body.setVelocity(ball, {x, y: y + 5})
        
    }  
});


const winningMessage = document.querySelector("div")

//win condition
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision)=> {
        const lables = ['bolle', 'goal'];
        if (
            lables.includes(collision.bodyA.label) &&
            lables.includes(collision.bodyB.label)) {
                winningMessage.classList.remove('active')
                engine.world.gravity.y = 1
                for (let body of world.bodies){
                    console.log(body)
                    if (body.label == 'wall') {
                        Body.setStatic(body, false)
                    }
                }        
        }
    })
})


