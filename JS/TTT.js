let boxes = document.querySelectorAll(".buttons");
let resetBtn = document.querySelector("#reset");
let newGameBtn = document.querySelector("#newgame");
let msgContainer = document.querySelector(".winner-message");
let msg = document.querySelector("#msg");

let turnO = true; // playerX, playerO
let scoreX = 0;
let scoreO = 0;

let playerX = prompt("Enter Player X name:");
let playerO = prompt("Enter Player O name:");

const API_URL = "http://localhost:3000";

// Register players
async function registerPlayer(name) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    await res.json();
  } catch (err) {
    console.error("Registration error:", err);
  }
}

registerPlayer(playerX);
registerPlayer(playerO);

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

const resetGame = () => {
  turnO = true;
  enableBoxes();
  msgContainer.classList.add("hide");
};

const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("win-highlight");
  });
};

const disableBoxes = () => {
  boxes.forEach((box) => (box.disabled = true));
};

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

    checkWinner();
  });
});

const showWinner = (winner) => {
  msg.innerText = `Congratulations ${winner}!`;
  msgContainer.classList.remove("hide");
  disableBoxes();

  if (winner === "X") {
    scoreX++;
    document.querySelector("#scoreX").innerText = scoreX;
  } else {
    scoreO++;
    document.querySelector("#scoreO").innerText = scoreO;
  }

  const result = winner === "X" ? "player1" : "player2";

  fetch(`${API_URL}/submit-game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player1: playerX,
      player2: playerO,
      result
    })
  });
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let [pos1, pos2, pos3] = pattern;

    if (
      boxes[pos1].innerText !== "" &&
      boxes[pos1].innerText === boxes[pos2].innerText &&
      boxes[pos2].innerText === boxes[pos3].innerText
    ) {
      boxes[pos1].classList.add("win-highlight");
      boxes[pos2].classList.add("win-highlight");
      boxes[pos3].classList.add("win-highlight");

      showWinner(boxes[pos1].innerText);
      return;
    }
  }

  let isDraw = true;
  boxes.forEach((box) => {
    if (box.innerText === "") isDraw = false;
  });

  if (isDraw) {
    msg.innerText = "It's a Draw!";
    msgContainer.classList.remove("hide");

    fetch(`${API_URL}/submit-game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player1: playerX,
        player2: playerO,
        result: "draw"
      })
    });
  }
};

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", () => {
  resetGame();
  scoreX = 0;
  scoreO = 0;
  document.querySelector("#scoreX").innerText = "0";
  document.querySelector("#scoreO").innerText = "0";
});

// === LEADERBOARD ===
const leaderboardBtn = document.getElementById("showLeaderboard");
const leaderboardBox = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

leaderboardBtn.addEventListener("click", async () => {
  leaderboardList.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/leaderboard`);
    const data = await res.json();

    data.forEach((player, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${player.name} — Wins: ${player.wins}, Draws: ${player.draws}, Losses: ${player.losses}`;
      leaderboardList.appendChild(li);
    });

    leaderboardBox.classList.toggle("hide");
  } catch (err) {
    console.error("Failed to load leaderboard:", err);
    leaderboardList.innerHTML = "<li>Could not load leaderboard.</li>";
    leaderboardBox.classList.remove("hide");
  }
});
