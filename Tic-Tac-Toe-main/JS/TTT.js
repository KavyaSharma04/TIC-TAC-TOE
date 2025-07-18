let boxes = document.querySelectorAll(".buttons");
let reset = document.querySelector("#reset");
let newGameButton = document.querySelector("#newgame");
let messageContainer = document.querySelector(".winner-message");
let msg = document.querySelector("#msg");

let scoreX = 0;
let scoreO = 0;
let winner = null;
let turnO = true;
let clicks = 0;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (turnO) {
      box.innerText = "O";
      turnO = false;
    } else {
      box.innerText = "X";
      turnO = true;
    }

    box.disabled = true;
    clicks++;

    box.classList.add("clicked");
    setTimeout(() => box.classList.remove("clicked"), 200);

    checkWinner();

    if (!winner && clicks === 9) {
      draw();
    }
  });
});

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let pos1val = boxes[pattern[0]].innerText;
    let pos2val = boxes[pattern[1]].innerText;
    let pos3val = boxes[pattern[2]].innerText;

    if (pos1val !== "" && pos1val === pos2val && pos2val === pos3val) {
      pattern.forEach((index) => {
        boxes[index].classList.add("win-highlight");
      });

      showWinner(pos1val);
      return;
    }
  }
};

const showWinner = (win) => {
  winner = win;
  msg.innerText = `Congratulations ${winner}! You Won!`;
  messageContainer.classList.remove("hide");
  disableButtons();

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });

  confetti({
    particleCount: 100,
    spread: 120,
    origin: { y: 0.4 },
  });

  if (winner === "X") {
    scoreX++;
    document.getElementById("scoreX").textContent = scoreX;
  } else if (winner === "O") {
    scoreO++;
    document.getElementById("scoreO").textContent = scoreO;
  }
};

const draw = () => {
  msg.innerText = `DRAW!`;
  messageContainer.classList.remove("hide");
  disableButtons();
};

const enableButtons = () => {
  for (let box of boxes) {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("win-highlight"); 
  }
};

const disableButtons = () => {
  for (let box of boxes) {
    box.disabled = true;
  }
};

const resetBoard = () => {
  turnO = true;
  winner = null;
  clicks = 0;
  enableButtons();
  messageContainer.classList.add("hide");
};

const resetGame = () => {
  const confirmReset = confirm(
    "Are you sure you want to reset the game and clear scores?"
  );
  if (confirmReset) {
    resetBoard();
    scoreX = 0;
    scoreO = 0;
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
  }
};

const swapBtn = document.getElementById("swapScores");
swapBtn.addEventListener("click", () => {
  [scoreX, scoreO] = [scoreO, scoreX];
  document.getElementById("scoreX").textContent = scoreX;
  document.getElementById("scoreO").textContent = scoreO;
});

newGameButton.addEventListener("click", resetBoard);
reset.addEventListener("click", resetGame);
