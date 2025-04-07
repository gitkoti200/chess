import React from 'react';
import Game from './Game';

class ManualGame extends Game {
  constructor(props) {
    super(props);
  }

  handleClick(i) {
    if (this.state.gameStatus === 'checkmate') return;

    const squares = this.state.squares.slice();
    const selectedPiece = this.state.selectedPiece;

    // If no piece is selected and the clicked square has a piece of the current player's color
    if (selectedPiece === null) {
      const piece = squares[i];
      const isWhitePiece = '♙♖♘♗♕♔'.includes(piece);
      if (piece && isWhitePiece === this.state.isWhiteTurn) {
        this.setState({ selectedPiece: i });
      }
      return;
    }

    // If a piece is selected and the move is valid
    if (this.isValidMoveWithoutCheck(selectedPiece, i)) {
      // Make the move
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
            isWhiteTurn: !this.state.isWhiteTurn,
            gameStatus: 'checkmate',
            winner: winner
          });
          return;
        }
      }

      // Check for check or checkmate
      const isWhiteKing = !this.state.isWhiteTurn;
      if (this.isKingInCheck(squares, isWhiteKing)) {
        if (this.isCheckmate(squares, isWhiteKing)) {
          const winner = isWhiteKing ? 'Black' : 'White';
          this.setState({
            squares: squares,
            selectedPiece: null,
            isWhiteTurn: !this.state.isWhiteTurn,
            gameStatus: 'checkmate',
            winner: winner
          });
          return;
        }
        this.setState({ gameStatus: 'check' });
      } else {
        this.setState({ gameStatus: 'active' });
      }

      this.setState({
        squares: squares,
        selectedPiece: null,
        isWhiteTurn: !this.state.isWhiteTurn
      });
    } else {
      // If the move is invalid, just deselect the piece
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
          <div>{this.state.isWhiteTurn ? "White's turn" : "Black's turn"}</div>
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

export default ManualGame;