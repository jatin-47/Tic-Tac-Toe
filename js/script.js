// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

// "X" or "O"
var player_mark;
var opponent_mark;

var curr_turn;
// E, M, I; 
//-1 - opponent is frnd
var ai_level; 

var redX = "#F83157"; // X
var greenO = "green"; // O

var winning_combos = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];
var origBoard = [0,0,0,0,0,0,0,0,0];

//getting the palyer_mark & opponent_mark and ai_level (difficulty) & setting up names in scoreboard
function get_data(opponent){
    if(document.getElementById("x").checked)
    {
        player_mark = "X";
        document.getElementById("player1").className = "mark_inactive";
        document.getElementById('player1_mark').innerHTML = `${player_mark} `;
        document.getElementById('player1_mark').style.color = redX;

        opponent_mark = "O";
        document.getElementById("player2").className = "mark_inactive";
        document.getElementById('player2_mark').innerHTML = `${opponent_mark} `;
        document.getElementById('player2_mark').style.color = greenO;
    }
    else
    {
        player_mark = "O";
        document.getElementById("player1").className = "mark_inactive";
        document.getElementById('player1_mark').innerHTML = `${player_mark} `;
        document.getElementById('player1_mark').style.color = greenO;

        opponent_mark = "X";
        document.getElementById("player2").className = "mark_inactive";
        document.getElementById('player2_mark').innerHTML = `${opponent_mark} `;
        document.getElementById('player2_mark').style.color = redX;
    }      
    
    if(opponent == "ai")
    {
        var diff_list = document.querySelectorAll(".carousel-item");
        diff_list.forEach( (tag) => {
            if(tag.classList.contains("active"))
                ai_level = tag.id;
        });
        document.getElementById("level").style.display = "block";
        document.getElementById("diff_chosen").innerHTML = (ai_level == "E") ? "Easy" : ((ai_level == "M") ? "Medium" : "Impossible");
        document.getElementById("player2").innerHTML = "AI";
    }
    else
    {
        ai_level = -1;
        document.getElementById("level").style.display = "none";
        document.getElementById("player2").innerHTML = "Player 2";
    }
}

var bg_img = document.getElementById("illus");
var menu_div = document.getElementById("menu");
var game_div = document.getElementById("game");

var matches = document.getElementById("matches");
var timer = document.getElementById("time");
var msg = document.getElementById("msg");
var cells = document.querySelectorAll("td");
var scoreboard = document.getElementById("scoreboard");   
var player1_score = document.getElementById("player1_score");     
var player2_score = document.getElementById("player2_score");
var draw_score = document.getElementById("draw_score");

var seconds = 0;
var timer_is_on = 0;
var t;

function padnum(num) {
    if(num <=9)
        num = `0${num}`;
    return num;
}
function timedCount() {
    var mins = padnum(parseInt(seconds/60));
    var secs = padnum(seconds - 60*mins);
    timer.innerHTML = `${mins}:${secs}`;
    seconds = seconds + 1;
    t = setTimeout(timedCount, 1000);
}
function startCount() {
    if (!timer_is_on) {
        timer_is_on = 1;
        timedCount();
    }
}
function stopCount() {
    clearTimeout(t);
    timer_is_on = 0;
}

function show_game(){
    menu_div.style.animationName = "slide-menu-up";
    game_div.style.animationName = "slide-game-up";
    bg_img.style.animationName = "fadeout";  
    scoreboard.style.bottom = "0";
    
    //resetting
    matches.innerHTML = "0";
    seconds = 0;
    timer.innerHTML = "00:00";

    player1_score.innerHTML = "0";
    player2_score.innerHTML = "0";
    draw_score.innerHTML = "0";
}
function show_menu(){
    menu_div.style.animationName = "slide-menu-down";
    game_div.style.animationName = "slide-game-down";
    bg_img.style.animationName = "fadein";
    scoreboard.style.bottom = "-100px";
}
function start_msg(turn)
{
    var name = (turn == player_mark) ? `Player 1 (${turn}) ` : ((ai_level == -1) ? `Player 2 (${turn}) ` : `AI (${turn}) `);
    msg.innerHTML = `${name} Starts`;

    msg.style.animationDelay = "0.3s";
    msg.style.animationName = "slide-in";
    
    setTimeout(() => {
        msg.style.animationName = "slide-out";
        add_event();
        msg.onanimationend = startCount();
        msg.onanimationend = check_ai_turn();
    }, 1500);
}
function winner_msg(winner)
{
    var name = (winner == player_mark) ? `Player 1 (${winner}) ` : ((ai_level == -1) ? `Player 2 (${winner}) ` : `AI (${winner}) `);
    msg.innerHTML = `${name} Wins!`;
    stopCount();
    msg.style.animationDelay = "0s";
    msg.style.animationName = "slide-in";            
}
function draw_msg()
{
    msg.innerHTML = `Draw!`;
    stopCount();
    msg.style.animationDelay = "0s";
    msg.style.animationName = "slide-in";
}

function toss()
{
    if( Math.round(Math.random()) == 0 )
        return player_mark;
    else
        return opponent_mark;
}

function reset()
{
    origBoard = [0,0,0,0,0,0,0,0,0];
    cells.forEach((cell) => {
        cell.innerHTML = "";
        cell.style.backgroundColor = "";
    });
    remove_event();
}

function add_event()
{
    cells.forEach((cell) => {
        cell.addEventListener('mouseover', turnmouse);
        cell.addEventListener('mouseleave', turnmouse);
        cell.addEventListener('click', turnmouse);
        cell.style.cursor = "pointer";
    });
}
function remove_event()
{
    cells.forEach((cell) => {
        cell.removeEventListener('mouseover', turnmouse);
        cell.removeEventListener('mouseleave', turnmouse);
        cell.removeEventListener('click', turnmouse);
        cell.style.cursor = "default";
    });
}

function active_player()
{
    document.getElementById("player1").className = "mark_inactive";
    document.getElementById("player2").className = "mark_inactive";
    if(player_mark == curr_turn)
    {
        document.getElementById("player1").className = `mark_${curr_turn}_active`;
    }
    else
    {
        document.getElementById("player2").className = `mark_${curr_turn}_active`;
    }
}

function turnmouse(event)
{
    turn(event.target.id, curr_turn, event.type);            
}

//randomlly chooses a spot
function easy_level()
{
    var unplayed_indexes = [];
    for(var i=0; i<origBoard.length; i++)
    {
        if(origBoard[i] == 0)
            unplayed_indexes.push(i);
    }
    return unplayed_indexes[Math.floor( Math.random()*unplayed_indexes.length )];
}

//dumb minimax with some randomness
function medium_level(newBoard, player)
{
    var availSpots = [];
    for(var i=0; i<newBoard.length; i++)
    {
        if(newBoard[i] == 0)
            availSpots.push(i);
    }

    // if terminal state reaches, return with the score
    if(checkWin(newBoard, opponent_mark)) //let opponent(ai) be the minimizer
        return {score: -10};
    else if(checkWin(newBoard, player_mark)) // let player1(human) be the maximiser
        return {score: 10};
    else if(availSpots.length == 0) // tie 
        return {score: 0};

    //storing score and index for each move possible from the given board state
    var moves = [];

     // loop through all available spots
    for (var i = 0; i < availSpots.length; i++)
    {
        //create an object for each and store the index of that spot 
        var move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player; // set the empty spot to the current player

        //collect the score resulted from calling minimax on the opponent of the current player
        if (player == opponent_mark){
            var result = medium_level(newBoard, player_mark);
            move.score = result.score;
        }
        else{
            var result = medium_level(newBoard, opponent_mark);
            move.score = result.score;
        }     
        // reset the spot to empty for the next loop itereration   
        newBoard[availSpots[i]] = 0;
        // push the object to the array
        moves.push(move);
    }

    // evaluating the best move in the moves array (i.e. all the possible moves)
    var bestMove;

    if(  Math.random() > 0.8 ) //randomness
    {
        bestMove = Math.floor( Math.random() * moves.length );
    }
    else
    {
        //if it is the ai's turn loop over the moves and choose the move with the lowest score 
        //as we have taken ai as the minimiser
        if(player === opponent_mark)
        {
            var bestScore = 10000;
            for(var i = 0; i < moves.length; i++){
                if(moves[i].score < bestScore)
                {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        else // else loop over the moves and choose the move with the highest score (as human player is the maximiser)
        {
            var bestScore = -10000;
            for(var i = 0; i < moves.length; i++){
                if(moves[i].score > bestScore)
                {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
    }
    // return the chosen move (object) from the moves array
    return moves[bestMove];
}

//minimax algorithm with alpha-beta pruning optimization
//Alpha is the best value that the maximizer (human) currently can guarantee at that level or below.
//Beta is the best value that the minimizer (ai) currently can guarantee at that level or below.
function minimax(newBoard, depth, alpha, beta, player)
{
    // calculating the playable spots in a board state
    var availSpots = [];
    for(var i=0; i<newBoard.length; i++)
    {
        if(newBoard[i] == 0)
            availSpots.push(i);
    }

    // if terminal state reaches, return with the score
    if(checkWin(newBoard, opponent_mark)) //let opponent(ai) be the minimizer
        return {score: -20+depth};
    else if(checkWin(newBoard, player_mark)) // let player1(human) be the maximiser
        return {score: 20-depth};
    else if(availSpots.length == 0) // tie 
        return {score: 0};


    //if it is the ai's turn, lowest score (as we have taken ai as the minimiser)
    if(player === opponent_mark)
    {
        var bestScore = 10000;
        var bestMove = {};
        for(var i = 0; i < availSpots.length; i++)
        {
            newBoard[availSpots[i]] = player; // set the empty spot to the current player
            
            var value = minimax(newBoard, depth+1, alpha, beta, player_mark);
            if(value.score < bestScore)
            {
                bestScore = value.score;
                bestMove.index = availSpots[i];
                bestMove.score = bestScore;
            }

            // reset the spot to empty for the next loop itereration
            newBoard[availSpots[i]] = 0;

            beta = Math.min(beta,bestScore);
            if(beta <= alpha)
                break;
        }
        return bestMove;
    }
    else // else highest score (as human player is the maximiser)
    {
        var bestScore = -10000;
        var bestMove = {};
        for(var i = 0; i < availSpots.length; i++)
        {
            newBoard[availSpots[i]] = player; // set the empty spot to the current player

            var value = minimax(newBoard, depth+1, alpha, beta, opponent_mark);
            if(value.score > bestScore)
            {
                bestScore = value.score;
                bestMove.index = availSpots[i];
                bestMove.score = bestScore;
            }

            // reset the spot to empty for the next loop itereration
            newBoard[availSpots[i]] = 0;

            alpha = Math.max(alpha,bestScore);
            if(beta <= alpha)
                break;    
        }
        return bestMove;
    }
}

function AI_move()
{
    if(ai_level == "E")
        return easy_level();
    else if(ai_level == "M")
        return medium_level(origBoard, opponent_mark).index;
    else if(ai_level == "I")
        return minimax(origBoard, 0, -10000, 10000, opponent_mark).index;
}

function check_ai_turn()
{
    if(ai_level != -1 && curr_turn == opponent_mark)
    {
        remove_event();
        setTimeout(() => {
            turn(AI_move(), curr_turn, "click");
        } , Math.floor( Math.random()*2000 + 1 ) );
    }
    else
        add_event();
}

function turn(cell_index, mark, mouseevent)
{
    var cell = document.getElementById(cell_index);
    if(origBoard[cell_index] == 0)
    {
        if(mouseevent == 'mouseover')
        {
            cell.style.opacity = 0.5;
            cell.style.color = "gray";
            cell.innerHTML = mark;
        }
        else if(mouseevent == 'mouseleave')
        {
            cell.style.opacity = 1;
            cell.innerHTML = "";
        }
        if(mouseevent == 'click')
        {
            origBoard[cell_index] = mark;
            cell.style.opacity = 1;
            cell.style.color = (mark == "X")? redX : greenO;
            cell.innerHTML = mark;

            var gameWon = checkWin(origBoard, mark);
            if(gameWon)
            {
                gameOver(gameWon);
            }
            else if(!checkTie())
            {
                curr_turn = (curr_turn == 'X')? 'O' : 'X';
                active_player();
                check_ai_turn();
            }
        }
    }
}

function checkTie()
{
    for(var i=0 ; i<origBoard.length; i++)
    {
        if(origBoard[i] == 0)
            return false;
    }
    remove_event();
    document.getElementById("next_match").disabled = false;
    draw_msg();
    matches.innerHTML = parseInt(matches.innerHTML) + 1;
    draw_score.innerHTML = parseInt(draw_score.innerHTML) + 1;
    return true;
}

function checkWin(board, player)
{
    var gameWon = null;
    var score = 0;
    var i;

    for(i = 0; i<winning_combos.length; i++)
    {
        score = 0;
        for(var j = 0; j<3; j++)
        {
            if(board[winning_combos[i][j]] == player)
                score++;
            else
                break;
        }
        if(score == 3)
        {
            gameWon = {index: i, player : player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) 
{
    for(var i = 0; i<3; i++)
    {
        document.getElementById(winning_combos[gameWon.index][i]).style.backgroundColor = "#f5f52c";
    }
    remove_event();
    document.getElementById("next_match").disabled = false;
    winner_msg(gameWon.player);
    matches.innerHTML = parseInt(matches.innerHTML) + 1;
    if(gameWon.player == player_mark)
    {
        player1_score.innerHTML = parseInt(player1_score.innerHTML) + 1;
    }
    else {
        player2_score.innerHTML = parseInt(player2_score.innerHTML) + 1;
    }

}

// opponent = "ai"/"frnd"
function play(opponent)
{
    document.getElementById("next_match").disabled = true;
    reset();
    get_data(opponent);

    curr_turn = toss();
    start_msg(curr_turn);          
    active_player();
}

function next_match()
{
    document.getElementById("next_match").disabled = true;
    msg.style.animationName = "slide-out";
    setTimeout(() => {
        if(ai_level == -1)
            play("frnd");
        else
            play("ai");
    }, 500)
}