import React from 'react';
import './Game.css';

class Game extends React.Component {
  constructor(props) {
    super(props);
    const initialSquares = Array(64).fill(null);
    const whitePieces = this.initializeWhitePieces();
    const blackPieces = this.initializeBlackPieces();
    
    this.resetGame = this.resetGame.bind(this);
    
    // Bind methods
    this.isValidMoveWithoutCheck = this.isValidMoveWithoutCheck.bind(this);
    this.isKingInCheck = this.isKingInCheck.bind(this);
    this.isCheckmate = this.isCheckmate.bind(this);
    
    // Initialize white pieces
    whitePieces.pawns.forEach(pos => initialSquares[pos] = '♙');
    whitePieces.rooks.forEach(pos => initialSquares[pos] = '♖');
    whitePieces.knights.forEach(pos => initialSquares[pos] = '♘');
    whitePieces.bishops.forEach(pos => initialSquares[pos] = '♗');
    whitePieces.queen.forEach(pos => initialSquares[pos] = '♕');
    whitePieces.king.forEach(pos => initialSquares[pos] = '♔');

    // Initialize black pieces
    blackPieces.pawns.forEach(pos => initialSquares[pos] = '♟');
    blackPieces.rooks.forEach(pos => initialSquares[pos] = '♜');
    blackPieces.knights.forEach(pos => initialSquares[pos] = '♞');
    blackPieces.bishops.forEach(pos => initialSquares[pos] = '♝');
    blackPieces.queen.forEach(pos => initialSquares[pos] = '♛');
    blackPieces.king.forEach(pos => initialSquares[pos] = '♚');

    this.state = {
      squares: initialSquares,
      whitePieces: whitePieces,
      blackPieces: blackPieces,
      isWhiteTurn: true,
      selectedPiece: null,
      gameStatus: 'active', // 'active', 'check', 'checkmate', 'stalemate'
      capturedWhitePieces: [],
      capturedBlackPieces: [],
      whiteScore: 0,
      blackScore: 0,
      winner: null
    };
  }

  initializeWhitePieces() {
    return {
      pawns: [48, 49, 50, 51, 52, 53, 54, 55],
      rooks: [56, 63],
      knights: [57, 62],
      bishops: [58, 61],
      queen: [59],
      king: [60]
    };
  }

  initializeBlackPieces() {
    return {
      pawns: [8, 9, 10, 11, 12, 13, 14, 15],
      rooks: [0, 7],
      knights: [1, 6],
      bishops: [2, 5],
      queen: [3],
      king: [4]
    };
  }

  isKingInCheck(squares, isWhiteKing) {
    const kingSymbol = isWhiteKing ? '♔' : '♚';
    const kingPosition = squares.findIndex(square => square === kingSymbol);
    const opponentPieces = isWhiteKing ? '♟♜♞♝♛♚' : '♙♖♘♗♕♔';
    
    for (let i = 0; i < 64; i++) {
      const piece = squares[i];
      if (piece && opponentPieces.includes(piece)) {
        if (this.isValidMoveWithoutCheck(i, kingPosition, squares)) {
          return true;
        }
      }
    }
    return false;
  }

  isCheckmate(squares, isWhiteKing) {
    if (!this.isKingInCheck(squares, isWhiteKing)) {
      return false;
    }

    const kingSymbol = isWhiteKing ? '♔' : '♚';
    const kingPosition = squares.findIndex(square => square === kingSymbol);
    const allyPieces = isWhiteKing ? '♙♖♘♗♕♔' : '♟♜♞♝♛♚';
    
    // Try all possible moves for all ally pieces
    for (let from = 0; from < 64; from++) {
      const piece = squares[from];
      if (piece && allyPieces.includes(piece)) {
        for (let to = 0; to < 64; to++) {
          if (this.isValidMoveWithoutCheck(from, to, squares)) {
            // Try the move
            const tempSquares = squares.slice();
            tempSquares[to] = tempSquares[from];
            tempSquares[from] = null;
            
            // If this move gets the king out of check, it's not checkmate
            if (!this.isKingInCheck(tempSquares, isWhiteKing)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  isValidMoveWithoutCheck(from, to) {
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const squares = this.state.squares;
    const piece = squares[from];
    const targetPiece = squares[to];

    // Check if target square has a piece of the same color
    if (targetPiece) {
      const isWhitePiece = '♙♖♘♗♕♔'.includes(piece);
      const isWhiteTarget = '♙♖♘♗♕♔'.includes(targetPiece);
      if (isWhitePiece === isWhiteTarget) return false;
    }

    // Pawn movement
    if (piece === '♙') { // White pawn
      if (colDiff === 0 && !targetPiece) { // Forward movement
        if (rowDiff === -1) return true; // One square forward
        if (rowDiff === -2 && fromRow === 6) { // Two squares from starting position
          return !squares[from - 8]; // Check if path is clear
        }
      }
      // Diagonal capture
      if (rowDiff === -1 && Math.abs(colDiff) === 1 && targetPiece) return true;
    } else if (piece === '♟') { // Black pawn
      if (colDiff === 0 && !targetPiece) {
        if (rowDiff === 1) return true;
        if (rowDiff === 2 && fromRow === 1) {
          return !squares[from + 8];
        }
      }
      if (rowDiff === 1 && Math.abs(colDiff) === 1 && targetPiece) return true;
    }

    // Knight movement
    if (piece === '♘' || piece === '♞') {
      return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
             (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
    }

    // Bishop movement
    if (piece === '♗' || piece === '♝') {
      if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false;
      return this.isPathClear(from, to, squares);
    }

    // Rook movement
    if (piece === '♖' || piece === '♜') {
      if (rowDiff !== 0 && colDiff !== 0) return false;
      return this.isPathClear(from, to, squares);
    }

    // Queen movement
    if (piece === '♕' || piece === '♛') {
      if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) return false;
      return this.isPathClear(from, to, squares);
    }

    // King movement
    if (piece === '♔' || piece === '♚') {
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    }

    return false;
  }

  isPathClear(from, to, squares) {
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (squares[currentRow * 8 + currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }

  getPossibleMoves(piece, position) {
    const possibleMoves = [];
    for (let i = 0; i < 64; i++) {
      if (this.isValidMoveWithoutCheck(position, i)) {
        possibleMoves.push(i);
      }
    }
    return possibleMoves;
  }

  getRandomMove() {
    const squares = this.state.squares;
    const blackPieces = [];
    
    // Find all black pieces and their positions
    squares.forEach((piece, index) => {
      if ('♟♜♞♝♛♚'.includes(piece)) {
        blackPieces.push({ piece, position: index });
      }
    });
    
    // Get all possible moves for each piece
    const allMoves = [];
    blackPieces.forEach(({ piece, position }) => {
      const moves = this.getPossibleMoves(piece, position);
      moves.forEach(move => {
        allMoves.push({ from: position, to: move });
      });
    });
    
    // Return a random move from all possible moves
    return allMoves.length > 0 ? allMoves[Math.floor(Math.random() * allMoves.length)] : null;
  }

  updateGameStatus(squares, isWhiteTurn) {
    const isWhiteKing = !isWhiteTurn; // Check the opposite king
    if (this.isCheckmate(squares, isWhiteKing)) {
      return 'checkmate';
    } else if (this.isKingInCheck(squares, isWhiteKing)) {
      return 'check';
    }
    return 'active';
  }

  handleClick(i) {
    if (this.state.gameStatus === 'checkmate') return;
    const squares = this.state.squares.slice();
    const currentPiece = squares[i];
    
    // Only allow white pieces to be moved by the player
    if (!this.state.isWhiteTurn) return;
    
    // If no piece is selected and clicked square has a white piece
    if (!this.state.selectedPiece && currentPiece) {
      const isWhitePiece = '♙♖♘♗♕♔'.includes(currentPiece);
      
      if (isWhitePiece) {
        this.setState({
          selectedPiece: i
        });
        return;
      }
    }
    
    // If a piece is selected and clicking on a different square
    if (this.state.selectedPiece !== null && this.state.selectedPiece !== i) {
      const fromSquare = this.state.selectedPiece;
      const toSquare = i;
      
      // Check if the move is valid according to chess rules
      if (this.isValidMoveWithoutCheck(fromSquare, toSquare)) {
        // Handle piece capture and scoring
        const capturedPiece = squares[toSquare];
        if (capturedPiece) {
          const isWhitePieceCaptured = '♙♖♘♗♕♔'.includes(capturedPiece);
          let points = 0;
          // Assign points based on piece type
          switch(capturedPiece) {
            case '♟':
            case '♙':
              points = 1; // Pawn
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
          if (isWhitePieceCaptured) {
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
            squares[toSquare] = squares[fromSquare];
            squares[fromSquare] = null;
            this.setState({
              squares: squares,
              selectedPiece: null,
              isWhiteTurn: false,
              gameStatus: 'checkmate'
            });
            return;
          }
        }

        // Move the white piece
        squares[toSquare] = squares[fromSquare];
        squares[fromSquare] = null;
        
        const gameStatus = this.updateGameStatus(squares, false);
        this.setState({
          squares: squares,
          selectedPiece: null,
          isWhiteTurn: false,
          gameStatus: gameStatus
        }, () => {
          // After white's move, automatically make black's move
          setTimeout(() => {
            const blackMove = this.getRandomMove();
            if (blackMove) {
              const newSquares = this.state.squares.slice();
              const capturedPiece = newSquares[blackMove.to];
              
              // Handle captured pieces
              if (capturedPiece) {
                const isWhitePieceCaptured = '♙♖♘♗♕♔'.includes(capturedPiece);
                let points = 0;
                // Assign points based on piece type
                switch(capturedPiece) {
                  case '♟':
                  case '♙':
                    points = 1; // Pawn
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
                if (isWhitePieceCaptured) {
                  this.setState(prevState => ({
                    capturedWhitePieces: [...prevState.capturedWhitePieces, capturedPiece],
                    blackScore: prevState.blackScore + points
                  }));
                }
              }
              
              // Check if computer captured the king
              if (capturedPiece === '♔') {
                newSquares[blackMove.to] = newSquares[blackMove.from];
                newSquares[blackMove.from] = null;
                this.setState({
                  squares: newSquares,
                  isWhiteTurn: true,
                  gameStatus: 'checkmate'
                });
                return;
              }
              
              // Execute black's move
              newSquares[blackMove.to] = newSquares[blackMove.from];
              newSquares[blackMove.from] = null;
              
              const gameStatus = this.updateGameStatus(newSquares, true);
              this.setState({
                squares: newSquares,
                isWhiteTurn: true,
                gameStatus: gameStatus
              });
            }
          }, 500); // Add a small delay for better UX
        });
      } else {
        // Invalid move, just deselect the piece
        this.setState({
          selectedPiece: null
        });
      }
    } else if (this.state.selectedPiece === i) {
      // Deselect the piece if clicking on it again
      this.setState({
        selectedPiece: null
      });
    }
  }

  // Calculate valid moves for the selected piece
  getValidMovesForPiece(piecePosition) {
    const validMoves = [];
    if (piecePosition === null) return validMoves;
    
    for (let i = 0; i < 64; i++) {
      if (this.isValidMoveWithoutCheck(piecePosition, i)) {
        validMoves.push(i);
      }
    }
    return validMoves;
  }

  renderSquare(i) {
    const { selectedPiece, squares, gameStatus } = this.state;
    const isSelected = selectedPiece === i;
    const piece = squares[i];
    const isKing = piece === '♔' || piece === '♚';
    
    // Determine if this square is a valid move destination
    let isValidMove = false;
    let isValidCapture = false;
    
    if (selectedPiece !== null) {
      const validMoves = this.getValidMovesForPiece(selectedPiece);
      isValidMove = validMoves.includes(i) && !squares[i];
      isValidCapture = validMoves.includes(i) && squares[i];
    }
    
    let className = `square ${isSelected ? 'selected' : ''}`;
    
    if (isValidMove) {
      className += ' valid-move';
    } else if (isValidCapture) {
      className += ' valid-capture';
    }
    
    if (isKing && (gameStatus === 'check' || gameStatus === 'checkmate')) {
      className += ` ${gameStatus}`;
    }
    
    return (
      <button 
        className={className}
        onClick={() => this.handleClick(i)}
      >
        {squares[i]}
      </button>
    );
  }

  resetGame() {
    const initialSquares = Array(64).fill(null);
    const whitePieces = this.initializeWhitePieces();
    const blackPieces = this.initializeBlackPieces();
    
    // Initialize white pieces
    whitePieces.pawns.forEach(pos => initialSquares[pos] = '♙');
    whitePieces.rooks.forEach(pos => initialSquares[pos] = '♖');
    whitePieces.knights.forEach(pos => initialSquares[pos] = '♘');
    whitePieces.bishops.forEach(pos => initialSquares[pos] = '♗');
    whitePieces.queen.forEach(pos => initialSquares[pos] = '♕');
    whitePieces.king.forEach(pos => initialSquares[pos] = '♔');

    // Initialize black pieces
    blackPieces.pawns.forEach(pos => initialSquares[pos] = '♟');
    blackPieces.rooks.forEach(pos => initialSquares[pos] = '♜');
    blackPieces.knights.forEach(pos => initialSquares[pos] = '♞');
    blackPieces.bishops.forEach(pos => initialSquares[pos] = '♝');
    blackPieces.queen.forEach(pos => initialSquares[pos] = '♛');
    blackPieces.king.forEach(pos => initialSquares[pos] = '♚');

    this.setState({
      squares: initialSquares,
      whitePieces: whitePieces,
      blackPieces: blackPieces,
      isWhiteTurn: true,
      selectedPiece: null,
      gameStatus: 'active',
      capturedWhitePieces: [],
      capturedBlackPieces: [],
      whiteScore: 0,
      blackScore: 0
    });
  }

  render = () => {
    const { gameStatus, isWhiteTurn, whiteScore, blackScore } = this.state;
    const status = gameStatus === 'checkmate' 
      ? `Game Over - ${!isWhiteTurn ? 'White' : 'Black'} Wins!`
      : `Next player: ${isWhiteTurn ? 'White' : 'Black'}`;
    const scoreStatus = `White: ${whiteScore} points | Black: ${blackScore} points`;
    const restartButton = (
      <button 
        className="restart-button" 
        onClick={this.resetGame}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px',
          marginBottom: '20px'
        }}
      >
        Restart Game
      </button>
    );

    return (
      <div className="game" style={{ position: 'relative' }}>
        {gameStatus === 'checkmate' && (
          <div className="victory-banner">
            {!isWhiteTurn ? 'White' : 'Black'} Wins!<br/>
            Final Score - White: {whiteScore} | Black: {blackScore}
          </div>
        )}
        <div className="game-info">
          <div>{status}</div>
          <div>{scoreStatus}</div>
          {restartButton}
        </div>
        <div className="game-board">
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
            {this.renderSquare(6)}
            {this.renderSquare(7)}
          </div>
          <div className="board-row">
            {this.renderSquare(8)}
            {this.renderSquare(9)}
            {this.renderSquare(10)}
            {this.renderSquare(11)}
            {this.renderSquare(12)}
            {this.renderSquare(13)}
            {this.renderSquare(14)}
            {this.renderSquare(15)}
          </div>
          <div className="board-row">
            {this.renderSquare(16)}
            {this.renderSquare(17)}
            {this.renderSquare(18)}
            {this.renderSquare(19)}
            {this.renderSquare(20)}
            {this.renderSquare(21)}
            {this.renderSquare(22)}
            {this.renderSquare(23)}
          </div>
          <div className="board-row">
            {this.renderSquare(24)}
            {this.renderSquare(25)}
            {this.renderSquare(26)}
            {this.renderSquare(27)}
            {this.renderSquare(28)}
            {this.renderSquare(29)}
            {this.renderSquare(30)}
            {this.renderSquare(31)}
          </div>
          <div className="board-row">
            {this.renderSquare(32)}
            {this.renderSquare(33)}
            {this.renderSquare(34)}
            {this.renderSquare(35)}
            {this.renderSquare(36)}
            {this.renderSquare(37)}
            {this.renderSquare(38)}
            {this.renderSquare(39)}
          </div>
          <div className="board-row">
            {this.renderSquare(40)}
            {this.renderSquare(41)}
            {this.renderSquare(42)}
            {this.renderSquare(43)}
            {this.renderSquare(44)}
            {this.renderSquare(45)}
            {this.renderSquare(46)}
            {this.renderSquare(47)}
          </div>
          <div className="board-row">
            {this.renderSquare(48)}
            {this.renderSquare(49)}
            {this.renderSquare(50)}
            {this.renderSquare(51)}
            {this.renderSquare(52)}
            {this.renderSquare(53)}
            {this.renderSquare(54)}
            {this.renderSquare(55)}
          </div>
          <div className="board-row">
            {this.renderSquare(56)}
            {this.renderSquare(57)}
            {this.renderSquare(58)}
            {this.renderSquare(59)}
            {this.renderSquare(60)}
            {this.renderSquare(61)}
            {this.renderSquare(62)}
            {this.renderSquare(63)}
          </div>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="captured-pieces">
            <div className="captured-white">
              <h3>Captured White Pieces:</h3>
              <div className="pieces">{this.state.capturedWhitePieces.join(' ')}</div>
            </div>
            <div className="captured-black">
              <h3>Captured Black Pieces:</h3>
              <div className="pieces">{this.state.capturedBlackPieces.join(' ')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} // End of Game class

export default Game;