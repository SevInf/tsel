export type AbstractExpressionTree = {
  kind: "AbstractExpressionTree";
  bindings: Identifier[];
  body: Expression;
};

export type Location = {
  start: number;
  end: number;
};

export type Identifier = {
  kind: "Identifier";
  name: string;
};

export type Expression =
  | UnaryOperator
  | BinaryOperator
  | FunctionCall
  | Identifier
  | PropertyAccess;

export type UnaryOperator = {
  kind: "UnaryOperator";
  operator: "+" | "-";
  operand: Expression;
};

export type BinaryOperator = {
  kind: "BinaryOperator";
  operator: "+" | "-" | "/" | "*" | ">" | "<" | ">=" | "<=" | "===";
  left: Expression;
  right: Expression;
};

export type PropertyAccess = {
  kind: "PropertyAccess";
  object: Identifier | PropertyAccess;
  property: Identifier;
};

export type FunctionCall = {
  kind: "FunctionCall";
  name: Identifier;
  arguments: Expression[];
};
