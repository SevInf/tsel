import {
  BinaryOperator,
  Expression,
  AbstractExpressionTree,
  Identifier,
  UnaryOperator,
} from "./ast";
import { Token, TokenList, TokenType } from "./tokenizer";

const PRECEDENCE_ADDITIVE = 11;
const PRECEDENCE_MULTIPLICATIVE = 12;
const PRECEDENCE_PROP_ACCESS = 17;
const PRECEDENCE_PREFIX = 14;
const PRECEDENCE_RELATIONAL = 9;
const PRECEDENCE_EQUALITY = 8;

export function parse(source: string): AbstractExpressionTree {
  const tokens = new TokenList(source);
  return parseExpressionFunction(tokens);
}

function parseExpressionFunction(tokens: TokenList): AbstractExpressionTree {
  const bindings = parseBindings(tokens);
  tokens.expect("=>");
  return {
    kind: "AbstractExpressionTree",
    bindings,
    body: parseExpression(tokens, 0),
  };
}

function parseBindings(tokens: TokenList): Identifier[] {
  const result: Identifier[] = [];
  tokens.expect("(");
  let token = tokens.consume();
  while (token.type !== ")") {
    if (token.type === "identifier") {
      result.push({
        kind: "Identifier",
        name: token.token,
      });
    } else {
      unexpectedToken(token);
    }

    token = tokens.consume();
    if (token.type === ",") {
      token = tokens.consume();
    } else if (token.type !== ")") {
      unexpectedToken(token);
    }
  }

  return result;
}

function parseExpression(tokens: TokenList, precedence: number): Expression {
  const token = tokens.lookahead();
  const prefix = prefixExpressions[token.type];
  if (!prefix) {
    unexpectedToken(token);
  }
  let left = prefix(tokens);
  let infixToken = tokens.lookahead();
  while (infixToken.type !== "eof") {
    let infixParserRecord = infixExpression[infixToken.type];
    if (!infixParserRecord) {
      unexpectedToken(token);
    }
    const [infixParser, infixPrecedence] = infixParserRecord;

    if (precedence >= infixPrecedence) {
      break;
    }
    left = infixParser(tokens, left, infixPrecedence);
    infixToken = tokens.lookahead();
  }

  return left;
}

type PrefixParsersMap = {
  [K in TokenType]?: (tokens: TokenList) => Expression;
};

const prefixExpressions: PrefixParsersMap = {
  identifier: parseIdentifier,
  "+": unaryOperator,
  "-": unaryOperator,
};

function unaryOperator(tokens: TokenList): UnaryOperator {
  const op = tokens.consume();
  return {
    kind: "UnaryOperator",
    operator: op.type as UnaryOperator["operator"],
    operand: parseExpression(tokens, PRECEDENCE_PREFIX),
  };
}

type InfixParsersMap = {
  [K in TokenType]?: [
    parser: (
      tokens: TokenList,
      left: Expression,
      precedence: number
    ) => Expression,
    precedence: number
  ];
};

const infixExpression: InfixParsersMap = {
  "+": [binaryOperator, PRECEDENCE_ADDITIVE],
  "-": [binaryOperator, PRECEDENCE_ADDITIVE],
  "/": [binaryOperator, PRECEDENCE_MULTIPLICATIVE],
  "*": [binaryOperator, PRECEDENCE_MULTIPLICATIVE],
  ">": [binaryOperator, PRECEDENCE_RELATIONAL],
  "<": [binaryOperator, PRECEDENCE_RELATIONAL],
  ">=": [binaryOperator, PRECEDENCE_RELATIONAL],
  "<=": [binaryOperator, PRECEDENCE_RELATIONAL],
  "===": [binaryOperator, PRECEDENCE_EQUALITY],
  "!==": [binaryOperator, PRECEDENCE_EQUALITY],
  ".": [
    (tokens, left, precedence) => {
      tokens.consume();
      if (left.kind !== "Identifier" && left.kind !== "PropertyAccess") {
        throw new Error("Can not access properties this way");
      }

      return {
        kind: "PropertyAccess",
        object: left,
        property: parseIdentifier(tokens),
      };
    },
    PRECEDENCE_PROP_ACCESS,
  ],
};

function binaryOperator(
  tokens: TokenList,
  left: Expression,
  precedence: number
): BinaryOperator {
  const op = tokens.consume();
  return {
    kind: "BinaryOperator",
    left,
    operator: op.type as BinaryOperator["operator"],
    right: parseExpression(tokens, precedence),
  };
}

function parseIdentifier(tokens: TokenList): Identifier {
  const id = tokens.expect("identifier");
  return {
    kind: "Identifier",
    name: id.token,
  };
}

function unexpectedToken(token: Token): never {
  throw new Error(`Unexpected token: ${token.type}`);
}
