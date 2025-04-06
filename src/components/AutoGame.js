import React from 'react';
import Game from './Game';

class AutoGame extends Game {
  constructor(props) {
    super(props);
  }

  // AI move calculation
  calculateAIMove() {
    const squares = this.state.squares.slice();
    const validMoves = [];

    // Collect all valid moves for black pieces
    for (let from = 0; from < 64; from++) {
      const piece = squares[from];
      if (piece && '♟♜♞♝♛♚'.includes(piece)) {
        for (let to = 0; to < 64; to++) {
          if (this.isValidMoveWithoutCheck(from, to)) {
            validMoves.push({ from, to });
          }
        }
      }
    }

    // Randomly select a valid move
    if (validMoves.length > 0) {
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      return move;
    }
    return null;
  }

  handleClick(i) {
    if (this.state.gameStatus === 'checkmate' || !this.state.isWhiteTurn) return;

    const squares = this.state.squares.slice();
    const selectedPiece = this.state.selectedPiece;

    // Handle white player's move
    if (selectedPiece === null) {
      const piece = squares[i];
      if (piece && '♙♖♘♗♕♔'.includes(piece)) {
        this.setState({ selectedPiece: i });
      }
      return;
    }

    // If a piece is selected and the move is valid
    if (this.isValidMoveWithoutCheck(selectedPiece, i)) {
      // Make the player's move
      const capturedPiece = squares[i];
      squares[i] = squares[selectedPiece];
      squares[selectedPiece] = null;

      // Update captured pieces and score
      if (capturedPiece) {
        let points = 1;
        switch(capturedPiece) {
          case '♟':
          case '♙':
            points = 2; // Pawn
            break;
          case '♞':
          case '♘':
          case '♝':
          case '♗':
            points = 3; // Knight/Bishop
            break;
          case '♜':
          case '♖':
            points = 5; // Rook
            break;
          case '♛':
          case '♕':
            points = 9; // Queen
            break;
          case '♚':
          case '♔':
            points = 50; // King (instant win)
            break;
        }

        if ('♙♖♘♗♕♔'.includes(capturedPiece)) {
          this.setState(prevState => ({
            capturedWhitePieces: [...prevState.capturedWhitePieces, capturedPiece],
            blackScore: prevState.blackScore + points
          }));
        } else {
          this.setState(prevState => ({
            capturedBlackPieces: [...prevState.capturedBlackPieces, capturedPiece],
            whiteScore: prevState.whiteScore + points
          }));
        }

        // Check if a king was captured
        if (capturedPiece === '♔' || capturedPiece === '♚') {
          const winner = capturedPiece === '♔' ? 'Black' : 'White';
          this.setState({
            squares: squares,
            selectedPiece: null,
            isWhiteTurn: false,
            gameStatus: 'checkmate',
            winner: winner
          });
          return;
        }
      }

      // Check game status after player's move
      if (this.isKingInCheck(squares, false)) {
        if (this.isCheckmate(squares, false)) {
          this.setState({
            squares: squares,
            selectedPiece: null,
            isWhiteTurn: false,
            gameStatus: 'checkmate'
          });
          return;
        }
        this.setState({ gameStatus: 'check' });
      } else {
        this.setState({ gameStatus: 'active' });
      }

      // Make AI move
      setTimeout(() => {
        const aiMove = this.calculateAIMove();
        if (aiMove) {
          const { from, to } = aiMove;
          const capturedPiece = squares[to];
          squares[to] = squares[from];
          squares[from] = null;

          if (capturedPiece) {
            if ('♙♖♘♗♕♔'.includes(capturedPiece)) {
              this.state.capturedWhitePieces.push(capturedPiece);
            } else {
              this.state.capturedBlackPieces.push(capturedPiece);
            }
          }

          // Check game status after AI's move
          if (this.isKingInCheck(squares, true)) {
            if (this.isCheckmate(squares, true)) {
              this.setState({
                squares: squares,
                selectedPiece: null,
                isWhiteTurn: true,
                gameStatus: 'checkmate'
              });
              return;
            }
            this.setState({ gameStatus: 'check' });
          } else {
            this.setState({ gameStatus: 'active' });
          }

          this.setState({
            squares: squares,
            isWhiteTurn: true
          });
        }
      }, 500);

      this.setState({
        squares: squares,
        selectedPiece: null,
        isWhiteTurn: false
      });
    } else {
      this.setState({ selectedPiece: null });
    }
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          {this.renderBoard()}
        </div>
        <div className="game-info">
          <div>{this.state.isWhiteTurn ? "Your turn" : "AI thinking..."}</div>
          <div>{this.state.gameStatus === 'check' ? 'Check!' : ''}</div>
          <div className="score-board">
            <div>White Score: {this.state.whiteScore}</div>
            <div>Black Score: {this.state.blackScore}</div>
          </div>
          <div className="captured-pieces">
            <div className="captured-white">
              Captured white pieces: {this.state.capturedWhitePieces.join(' ')}
            </div>
            <div className="captured-black">
              Captured black pieces: {this.state.capturedBlackPieces.join(' ')}
            </div>
          </div>
          {this.state.gameStatus === 'checkmate' && (
            <div className="victory-banner">
              {this.state.winner} wins!
              <div className="final-score">
                Final Score:
                <div>White: {this.state.whiteScore}</div>
                <div>Black: {this.state.blackScore}</div>
              </div>
            </div>
          )}
          <button onClick={this.resetGame}>Reset Game</button>
        </div>
      </div>
    );
  }
}

export default AutoGame;