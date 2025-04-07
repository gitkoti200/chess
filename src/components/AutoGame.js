import React from 'react';
import Game from './Game';

class AutoGame extends Game {
  constructor(props) {
    super(props);
  }

  // AI move calculation with strategic evaluation
  calculateAIMove() {
    const squares = this.state.squares.slice();
    const validMoves = [];

    // Collect all valid moves for black pieces with evaluation
    for (let from = 0; from < 64; from++) {
      const piece = squares[from];
      if (piece && '♟♜♞♝♛♚'.includes(piece)) {
        for (let to = 0; to < 64; to++) {
          if (this.isValidMoveWithoutCheck(from, to)) {
            // Evaluate the move
            const moveScore = this.evaluateMove(from, to, squares);
            validMoves.push({ from, to, score: moveScore });
          }
        }
      }
    }

    // Sort moves by score (highest first)
    validMoves.sort((a, b) => b.score - a.score);

    // Select one of the top moves with some randomness for variety
    // Take top 30% of moves or at least 3 moves if available
    const topMovesCount = Math.max(3, Math.floor(validMoves.length * 0.3));
    const topMoves = validMoves.slice(0, Math.min(topMovesCount, validMoves.length));
    
    if (topMoves.length > 0) {
      const selectedIndex = Math.floor(Math.random() * topMoves.length);
      return topMoves[selectedIndex];
    }
    return null;
  }

  // Evaluate a move and return a score
  evaluateMove(from, to, squares) {
    let score = 0;
    const piece = squares[from];
    const targetPiece = squares[to];
    
    // Piece value for captures
    if (targetPiece) {
      switch(targetPiece) {
        case '♙': score += 10; break;  // Pawn
        case '♘': case '♗': score += 30; break;  // Knight/Bishop
        case '♖': score += 50; break;  // Rook
        case '♕': score += 90; break;  // Queen
        case '♔': score += 900; break; // King
      }
      
      // Evaluate piece trade (if our piece is less valuable than the captured piece)
      const attackingPieceValue = this.getPieceValue(piece);
      const capturedPieceValue = this.getPieceValue(targetPiece);
      if (capturedPieceValue > attackingPieceValue) {
        score += 5; // Bonus for favorable trades
      }
    }
    
    // Positional evaluation
    // Center control for pawns and knights
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    // Center control bonus
    if ((toRow >= 3 && toRow <= 4) && (toCol >= 3 && toCol <= 4)) {
      if (piece === '♟') score += 5;  // Pawns in center
      if (piece === '♞') score += 3;  // Knights in center
    }
    
    // Pawn advancement
    if (piece === '♟') {
      score += toRow - 1; // Bonus for advancing pawns (they start at row 1)
    }
    
    // King safety - keep the king away from the center in early/mid game
    if (piece === '♚') {
      // Penalize king movement to the center
      if ((toRow >= 2 && toRow <= 5) && (toCol >= 2 && toCol <= 5)) {
        score -= 10;
      }
    }
    
    // Check if this move puts the opponent in check
    const tempSquares = squares.slice();
    tempSquares[to] = tempSquares[from];
    tempSquares[from] = null;
    if (this.isKingInCheck(tempSquares, true)) { // true for white king
      score += 15; // Bonus for putting opponent in check
    }
    
    return score;
  }
  
  // Helper to get piece value
  getPieceValue(piece) {
    switch(piece) {
      case '♟': case '♙': return 10;  // Pawn
      case '♞': case '♘': return 30;  // Knight
      case '♝': case '♗': return 30;  // Bishop
      case '♜': case '♖': return 50;  // Rook
      case '♛': case '♕': return 90;  // Queen
      case '♚': case '♔': return 900; // King
      default: return 0;
    }
  }

  handleClick(i) {
    if (this.state.gameStatus === 'checkmate' || !this.state.isWhiteTurn) return;

    const squares = this.state.squares.slice();
    const selectedPiece = this.state.selectedPiece;

    // Handle white player's move
    if (selectedPiece === null) {
      const piece = squares[i];
      if (piece && '♙♖♘♗♕♔'.includes(piece)) {
        // When selecting a piece, calculate and show valid moves
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
              this.setState(prevState => ({
                capturedWhitePieces: [...prevState.capturedWhitePieces, capturedPiece],
                blackScore: prevState.blackScore + (capturedPiece === '♔' ? 50 : 1)
              }));
            } else {
              this.setState(prevState => ({
                capturedBlackPieces: [...prevState.capturedBlackPieces, capturedPiece],
                whiteScore: prevState.whiteScore + (capturedPiece === '♚' ? 50 : 1)
              }));
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
 m            <div>Your Score: {this.state.whiteScore}</div>
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
                <div>Your Score: {this.state.whiteScore}</div>
                <div>AI Score: {this.state.blackScore}</div>
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