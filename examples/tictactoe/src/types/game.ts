// 0 represents empty
// 1 represents O
// 2 represents X
export type Player = 1 | 2;

export type PlayField = 0 | Player;

export interface GameBoard {
  squares: PlayField[];
}
