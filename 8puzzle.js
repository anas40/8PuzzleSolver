
class PQ {
    //dummy fill position 0 for simpler sink and swim operations
    //heap will contains nodes
    heap
    size

    constructor() {
        this.size = 0
        this.heap = [{ previos: null, board: null, moves: 0, priority: Number.MAX_SAFE_INTEGER }]
    }

    sink(idx) {
        let c1 = idx * 2;
        let c2 = c1 + 1
        if (c2 <= this.size) {
            let smaller = c1
            if (this.heap[smaller].priority > this.heap[c2].priority)
                smaller = c2
            if (this.heap[idx].priority > this.heap[smaller].priority) {
                this.swap(smaller, idx, this.heap)
                this.sink(smaller)
            }
        } else if (c1 <= this.size && this.heap[idx].priority > this.heap[c1].priority) {
            this.swap(c1, idx, this.heap)
            this.sink(c1)
        }
    }

    swim(idx) {
        while (idx > 0) {
            let parent = Math.floor(idx / 2);
            if (parent > 0 && this.heap[parent].priority > this.heap[idx].priority)
                this.swap(parent, idx, this.heap);
            else
                break;
            idx = parent;
        }
    }

    push(val) {
        this.heap.push(val)
        this.size++;
        this.swim(this.size)
    }
    pop() {
        this.swap(1, this.size, this.heap)
        let max = this.heap[this.size]
        this.size--
        this.heap.pop()
        this.sink(1)
        return max
    }
    swap(i, j) {
        let t = this.heap[i]
        this.heap[i] = this.heap[j]
        this.heap[j] = t
    }
}
class Node {
    previos;
    board;
    moves;
    priority;

    constructor(b, p, m) {
        this.board = b;
        this.previos = p;
        this.moves = m;
        this.priority = m + b.manhattan;
    }
}

class Board {
    board;
    size;
    hamming;
    manhattan;
    blankI;
    blankJ;

    // create a board from an n-by-n array of tiles,
    // where tiles[row][col] = tile at (row, col)
    constructor(tiles) {
        this.manhattan = 0;
        this.hamming = 0;

        this.size = tiles.length;
        this.board = emptyArray(this.size, this.size);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = tiles[i][j];
                if (this.board[i][j] == 0) {
                    this.blankI = i;
                    this.blankJ = j;
                }

                let boardNum = this.abs(this.board[i][j] - (i * this.size + j + 1));
                if (boardNum != 0 && this.board[i][j] != 0) {
                    this.hamming++;
                    this.manhattan += boardNum % this.size + parseInt(boardNum / this.size);
                }
            }
        }

    }

    exchangeBlank(i, j) {
        let temp = this.board[i][j];
        this.board[i][j] = 0;
        this.board[this.blankI][this.blankJ] = temp;
        this.blankI = i;
        this.blankJ = j;
    }

    abs(num) {
        if (num < 0) {
            return -num;
        }
        return num;
    }
    // string representation of this board
    toString() {
        let out = this.size;
        for (let i = 0; i < this.size; i++) {
            out += "\n";
            for (let j = 0; j < this.size; j++) {
                out += this.board[i][j];
            }
        }
        return out;
    }


    // board dimension n
    dimension() {
        return this.size;
    }


    // is this board the goal board?
    isGoal() {
        if (this.hamming == 0) {
            return true;
        }
        return false;
    }

    equals(y) {
        if (this.size != y.length)
            return false;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (y[i][j] != this.board[i][j])
                    return false;
            }
        }
        return true;

    }

    // all neighboring boards
    neighbors() {
        let n = [];
        let moves = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        moves.forEach(move => {
            let ni = this.blankI + move[0];
            let nj = this.blankJ + move[1];
            if (ni < this.size && ni >= 0 && nj < this.size && nj >= 0) {
                this.exchangeBlank(ni, nj);
                let b = new Board(this.board);
                this.exchangeBlank(ni - move[0], nj - move[1]);
                n.push(b);
            }
        })
        return n;
    }

    exchange(i, j, si, sj) {
        let temp = this.board[i][j];
        this.board[i][j] = this.board[si][sj];
        this.board[si][sj] = temp;
    }
    randomInt(size = this.size) {
        return Math.floor((Math.random() * size))
    }
    // a board that is obtained by exchanging any pair of tiles
    twin() {
        let fi = this.randomInt();
        let fj = this.randomInt();
        while (fi === this.blankI && fj === this.blankJ) {
            fi = this.randomInt();
            fj = this.randomInt();
        }
        let si = this.randomInt();
        let sj = this.randomInt();
        while ((si === this.blankI && sj === this.blankJ) || (fi === si && fj === sj)) {
            si = this.randomInt();
            sj = this.randomInt();
        }

        this.exchange(si, sj, fi, fj);
        let b = new Board(this.board);
        this.exchange(si, sj, fi, fj);
        return b;
    }

}

class Solver {

    Solution;
    stk = [];

    // find a solution to the initial board (using the A* algorithm)
    constructor(initial) {
        this.Solution = null;
        let pq = new PQ();
        pq.push(new Node(initial, null, 0));
        while (pq.size > 0) {
            let node = pq.pop();
            if (node.moves > 50) {
                console.log("huge");
                break;
            }
            if (node.board.isGoal() == true) {
                this.Solution = node;
                let copy = node;
                while (copy != null) {
                    this.stk.push(copy.board.board);
                    copy = copy.previos;
                }
                break;
            }
            node.board.neighbors().forEach(n => {
                if (node.previos != null && node.previos.board.equals(n.board) == false) {
                    pq.push(new Node(n, node, node.moves + 1));
                } else if (node.previos == null) {
                    pq.push(new Node(n, node, node.moves + 1));
                }
            })
        }
    }

    // min number of moves to solve initial board; -1 if unsolvable
    moves() {
        if (this.Solution == null)
            return -1;
        return this.Solution.moves;
    }

    // sequence of boards in a shortest solution; null if unsolvable
    solution() {
        let ans = [...this.stk]
        return ans.reverse()
    }
}

const row = 3
const col = 3
const images = {
    1: "./doge/1.png",
    2: "./doge/2.png",
    3: "./doge/3.png",
    4: "./doge/4.png",
    5: "./doge/5.png",
    6: "./doge/6.png",
    7: "./doge/7.png",
    8: "./doge/8.png",
    9: "./doge/9.png",
    0: ""
}

let tiles = [[1, 2, 3], [4, 5, 6,], [7, 8, 0]]


window.addEventListener('load', () => {
    checkoverflow()
    document.querySelector('#shuffle').addEventListener('click', generateGrid)
    document.querySelector('#start').addEventListener('click', solve);
    // document.querySelector('.box').style.gridTemplateColumns = `repeat(${col},1fr)`
    generateGrid()
});

async function solve() {
    const board = new Board(tiles);
    const solver = new Solver(board);
    const solution = solver.solution()
    let prevNum = null;
    for (const board of solution) {
        let curri, currj;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === 0) {
                    curri = i;
                    currj = j;
                    break;
                }
            }
        }
        const currNum = (curri * col + currj + 1) % 9;
        if (prevNum !== null) {
            console.log("hello");
            const currBox = document.querySelector(`.box${currNum}`)
            const prevBox = document.querySelector(`.box${prevNum}`)

            
            // console.log(currBox,prevBox);

            currBox.classList.add(`box${prevNum}`)
            currBox.classList.remove(`box${currNum}`)
            prevBox.classList.add(`box${currNum}`)
            prevBox.classList.remove(`box${prevNum}`)
            
            // console.log(currBox, prevBox);

            //tricky situation
            //reference is changed here because of changing of classes
            //currBox has become prevBox and prevBox has becom currBox
            currBox.classList.remove('blankBox')
            prevBox.classList.add('blankBox')
        }
        prevNum = currNum

        await sleep(500);
    }
    tiles = solution[solution.length-1]
    document.querySelector('.box0').innerHTML = '<img src="./doge/9.png" />'

}


function isValid(arr) {
    let flat = JSON.parse(JSON.stringify(arr)).flat()
    let inversion = 0;
    for (let i = 0; i < flat.length; i++) {
        for (let j = i + 1; j < flat.length; j++) {
            if (flat[i] === 0 || flat[j] === 0) continue;
            if (flat[j] < flat[i]) inversion++
        }
    }
    if (inversion % 2 === 0) return true;
    return false;
}

function generateGrid() {
    do {
        tiles = shuffle(tiles);
        console.log("Turn");
    }
    while (!isValid(tiles))
    const box = document.querySelector('.box');
    box.innerHTML = ''
    console.log(tiles);
    for (let i = 0; i < col; i++) {
        for (let j = 0; j < col; j++) {
            let div = document.createElement('div');
            let id = tiles[i][j];
            div.classList = `box${(i * col + j + 1) % 9} childBox`;
            div.innerHTML = `<img src="${images[id]}" />`;
            box.appendChild(div);
        }

    }
}
function getRowCol(num, columns) {
    let row = Math.floor(num / columns);
    let col = num % columns;
    return [row, col];
}
function shuffle(array, n = 9) {
    let arr = JSON.parse(JSON.stringify(array))
    for (let k = n - 1; k > 0; k--) {
        let rcol = Math.floor(Math.random() * (k + 1))
        let [oi, oj] = getRowCol(k, col);
        let [ni, nj] = getRowCol(rcol, col);
        let temp = arr[oi][oj];
        arr[oi][oj] = arr[ni][nj];
        arr[ni][nj] = temp;
    }
    return arr;
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function emptyArray(r, c) {
    let arr = new Array(r)
    for (let i = 0; i < r; i++) {
        arr[i] = new Array(c);
        arr[i].fill(0);
    }
    return arr
}

function checkoverflow(box = document.querySelector('.box')) {
    let makeWidth = screen.width * 0.70
    if (makeWidth > screen.height * 0.70) {
        makeWidth = screen.height * 0.70
    }
    makeWidth = Math.floor(makeWidth)
    box.style.width = `${makeWidth}px`
    box.style.height = `${makeWidth}px`
    console.log(makeWidth);
}

