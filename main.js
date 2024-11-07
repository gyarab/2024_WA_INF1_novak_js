class Minesweeper {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.flags = mines;
    this.board = this.createBoard();
    this.placeMines();
    this.interval = null;
    this.startTimer();
  }

  createBoard() {
    return Array.from({ length: this.rows }, () => 
      Array.from({ length: this.cols }, () => ({ mine: false, number: 0, revealed: false, flagged: false }))
    );
  }

  placeMines() {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],         [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    let minePositions = new Set();
    while (minePositions.size < this.mines) {
      let position = Math.floor(Math.random() * this.rows * this.cols);
      minePositions.add(position);
    }

    minePositions.forEach(pos => {
      let r = Math.floor(pos / this.cols);
      let c = pos % this.cols;
      this.board[r][c].mine = true;
      
      directions.forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !this.board[nr][nc].mine) {
          this.board[nr][nc].number += 1;
        }
      });
    });
  }

  revealCell(row, col) {
    if (this.isOutOfBounds(row, col) || this.board[row][col].revealed || this.board[row][col].flagged) return;

    this.board[row][col].revealed = true;
    if (this.board[row][col].mine) {
      this.showAllMines();
      this.showModal("Game Over");
    } else if (this.board[row][col].number === 0) {
      this.revealEmptyNeighbors(row, col);
    } else if (this.checkWin()) {
      this.showModal("You Win!");
    }
  }

  revealEmptyNeighbors(row, col) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],         [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    directions.forEach(([dr, dc]) => this.revealCell(row + dr, col + dc));
  }

  toggleFlag(row, col) {
    if (this.isOutOfBounds(row, col) || this.board[row][col].revealed) return;

    this.board[row][col].flagged = !this.board[row][col].flagged;
    this.flags += this.board[row][col].flagged ? -1 : 1;
    if (this.checkWin()) this.showModal("You Win!");
  }

  checkWin() {
    return this.board.flat().every(cell => (cell.mine || cell.revealed));
  }

  isOutOfBounds(row, col) {
    return row < 0 || row >= this.rows || col < 0 || col >= this.cols;
  }

  showAllMines() {
    this.board.flat().forEach(cell => {
      if (cell.mine) cell.revealed = true;
    });
  }

  showModal(text) {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
    modal.querySelector("h2").textContent = text;
    this.stopTimer();
  }

  reset() {
    this.board = this.createBoard();
    this.placeMines();
    this.flags = this.mines;
    this.stopTimer();
    this.startTimer();
    document.getElementById("modal").style.display = "none";
  }

  startTimer() {
    const timer = document.getElementById("timer");
    const start = Date.now();

    this.interval = setInterval(() => {
      const delta = Date.now() - start;
      const min = String(Math.floor(delta / 60000)).padStart(2, '0');
      const sec = String(Math.floor((delta % 60000) / 1000)).padStart(2, '0');
      timer.textContent = `${min}:${sec}`;
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const game = new Minesweeper(15, 15, 30);

function createBoardHTML() {
  const boardElement = document.getElementById("minesweeper-board");
  const modalButton = document.getElementById("modal-button");
  modalButton.addEventListener("click", () => {
    game.reset();
    updateBoardHTML();
  });
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", () => {
    game.reset();
    updateBoardHTML();
  });
  boardElement.innerHTML = "";
  for (let r = 0; r < game.rows; r++) {
    const rowElement = document.createElement("tr");
    for (let c = 0; c < game.cols; c++) {
      const cellElement = document.createElement("td");
      cellElement.addEventListener("click", () => {
        game.revealCell(r, c);
        updateBoardHTML();
      });
      cellElement.addEventListener("contextmenu", event => {
        event.preventDefault();
        game.toggleFlag(r, c);
        updateBoardHTML();
      });
      rowElement.appendChild(cellElement);
    }
    boardElement.appendChild(rowElement);
  }
}

function updateBoardHTML() {
  const boardElement = document.getElementById("minesweeper-board");
  const flagCountElement = document.getElementById("flagCount");
  flagCountElement.textContent = game.flags;
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      const cellElement = boardElement.rows[r].cells[c];
      const cell = game.board[r][c];
      cellElement.className = cell.revealed ? "revealed" : "";
      cellElement.textContent = cell.revealed ? (cell.mine ? "M" : cell.number || "") : "";
      if (cell.flagged) cellElement.classList.add("flagged");
    }
  }
}

createBoardHTML();