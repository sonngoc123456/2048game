import React, { useState } from "react";
import Tile from "./Tile";
import Cell from "./Cell";
import { Board } from "../helper";
import useEvent from "../hooks/useEvent";
import GameOverlay from "./GameOverlay";
import axios from "axios"

const BoardView = () => {
  const [board, setBoard] = useState(new Board());

  const handleKeyDown = (event) => {
    if (board.hasWon()) {
      return;
    }

    if (event.keyCode >= 37 && event.keyCode <= 40) {
      let direction = event.keyCode - 37;
      let boardClone = Object.assign(
        Object.create(Object.getPrototypeOf(board)),
        board
      );
      let newBoard = boardClone.move(direction);
      setBoard(newBoard);
    }
  };

  useEvent("keydown", handleKeyDown);

  const cells = board.cells.map((row, rowIndex) => {
    return (
      <div key={rowIndex}>
        {row.map((col, colIndex) => {
          return <Cell key={rowIndex * board.size + colIndex} />;
        })}
      </div>
    );
  });

  const tiles = board.tiles
    .filter((tile) => tile.value !== 0)
    .map((tile, index) => {
      return <Tile tile={tile} key={index} />;
    });

  const getUserApi = async () => {
    const result = await axios.get('https://webgame395group.herokuapp.com/api/getUser')
    return result
  }

   let [user, setUser] = useState({})

  const setPointApi = async () => {
    getUserApi().then(res =>{
      const email = JSON.parse(res.data.message)[0].email
      const code = JSON.parse(res.data.message)[0].code
      setUser(({ email: email, code: code}))
    }).catch(err => console.log(err))
    const result = await axios.request({
      url: 'https://webgame395group.herokuapp.com/api/setpoint',
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      data: JSON.stringify({
        email: user.email,
        code: user.code,
        point: board.score
      }),
    })
    return result
  }

  const resetGame = () => {
    setPointApi()
        .then(res => {
          console.log(res.data)
        })
        .catch(err => console.error(err.message));
  };

  return (
    <div>
      <div className="details-box">
        <div className="resetButton" onClick={resetGame}>
          New Game
        </div>
        <div className="score-box">
          <div className="score-header">PUNTOS</div>
          <div>{board.score}</div>
        </div>
      </div>
      <div className="board">
        {cells}
        {tiles}
        <GameOverlay onRestart={resetGame} board={board} />
      </div>
    </div>
  );
};

export default BoardView;
