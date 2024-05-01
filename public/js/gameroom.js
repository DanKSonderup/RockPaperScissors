const resultElement = document.querySelector('.result');
resultElement.innerHTML = "Vælg dit træk!";

const gameContainer = document.querySelector(".container");
const [userResult, opponentResult, result] = document.querySelectorAll(".user_result img, .cpu_result img, .result");
const optionImages = document.querySelectorAll(".option_image");
const yourWins = document.getElementById('yourWins');
const opponentWins = document.getElementById('opponentWins');

const roomId = document.querySelector('#roomidheader').textContent;
const clientId = socket.id;
let assignedUser = 'none';
let userIndex = -1;

socket.emit('requestUser', roomId, clientId);

function constructUrl(path) {
    const baseUrl = window.location.origin + window.location.pathname;
    const mixedUrl = `${baseUrl}${path}`;
    console.log(mixedUrl);
    return mixedUrl;
}

optionImages.forEach((image, index) => {
    image.addEventListener("click", (e) => {
        constructUrl("images/rock.png");
        image.classList.add("active");
        userResult.src = opponentResult.src = constructUrl("images/rock.png");
        result.textContent = "Vent på modstander...";
        optionImages.forEach((image2, index2) => {
            if (index !== index2) {
                image2.classList.remove("active");
            }
        });
        gameContainer.classList.add("start");
        let imageSrc = e.target.querySelector("img").src;
        userResult.src = imageSrc;
        let userValue = ["R", "S", "P"][index];
        socket.emit('turnTaken', roomId, userIndex, userValue);
    });
});

socket.on('userGranted', function ({ users }) {
    userIndex = users.findIndex(user => user.clientID === clientId);
});

socket.on('roundWinner', function (roundWinner) {
    let opponentIndex = userIndex === 1 ? 0 : 1;
    let playerPick = roundWinner.playerPicks[userIndex];
    let opponentPick = roundWinner.playerPicks[opponentIndex];
    setTimeout(() => {
        gameContainer.classList.remove("start");
        let pickToNum = ['R', 'S', 'P'];
        let pickImages = ["/images/rock.png", "images/scissors.png", "/images/paper.png"];
        opponentResult.src = pickImages[pickToNum.indexOf(opponentPick)];
        userResult.src = pickImages[pickToNum.indexOf(playerPick)];
        if (roundWinner.roundWinner === -1) {
            result.textContent = "Uafgjort";
        } else if (roundWinner.roundWinner === userIndex) {
            let currentWinsTemp = yourWins.textContent.split(': ')[1];
            let newWins = parseInt(currentWinsTemp) + 1;
            yourWins.textContent = `Dine wins: ${newWins}`;
            result.textContent = "Du vandt!";
        } else {
            let currentWinsOppTemp = opponentWins.textContent.split(': ')[1];
            let newOppWins = parseInt(currentWinsOppTemp) + 1;
            opponentWins.textContent = `Modtanders wins: ${newOppWins}`;
            result.textContent = "Modstander vinder";
        }
    }, 50);
});