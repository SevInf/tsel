export type TokenType =
  | "("
  | ")"
  | "{"
  | "}"
  | "=>"
  | ","
  | "eof"
  | "identifier"
  | "number"
  | "+"
  | "-"
  | "/"
  | "*"
  | ">"
  | "<"
  | ">="
  | "<="
  | "==="
  | "!=="
  | ".";

export type Token = {
  type: TokenType;
  token: string;
  start: number;
  end: number;
};

type TokenizationRule = {
  type: TokenType;
  pattern: RegExp;
};

const tokenizationRules: TokenizationRule[] = [
  { type: "(", pattern: /\(/y },
  { type: ")", pattern: /\)/y },
  { type: "{", pattern: /\{/y },
  { type: "}", pattern: /}/y },
  { type: ",", pattern: /,/y },
  { type: "identifier", pattern: /[a-zA-Z][a-zA-Z0-9]*/y },
  { type: "=>", pattern: /=>/y },
  { type: "+", pattern: /\+/y },
  { type: "-", pattern: /-/y },
  { type: "/", pattern: /\//y },
  { type: "*", pattern: /\*/y },
  { type: ">", pattern: />/y },
  { type: "<", pattern: /</y },
  { type: ">=", pattern: />=/y },
  { type: "<=", pattern: /<=/y },
  { type: "===", pattern: /===/y },
  { type: "!==", pattern: /!==/y },
  { type: ".", pattern: /\./y },
];

const SPACE_REGEX = /[\s\n\r]+/y;

type LazyTokenizer = () => Token;

function createLazyTokenizer(input: string): LazyTokenizer {
  let offset = 0;

  const consumeSpace = () => {
    SPACE_REGEX.lastIndex = offset;
    const spaceMatch = SPACE_REGEX.exec(input);
    if (spaceMatch) {
      offset += spaceMatch[0].length;
    }
  };

  return (): Token => {
    consumeSpace();
    if (offset === input.length) {
      return {
        type: "eof",
        token: "",
        start: offset,
        end: offset,
      };
    }
    for (const rule of tokenizationRules) {
      rule.pattern.lastIndex = offset;
      const match = rule.pattern.exec(input);
      if (!match) {
        continue;
      }
      const token = match[0];
      const start = offset;
      const end = offset + token.length;
      offset = end;

      return {
        type: rule.type,
        token,
        start,
        end,
      };
    }

    throw new Error("Unexpected token");
  };
}

export class TokenList {
  private currentTokenPointer = 0;
  private computedTokens: Token[] = [];
  private computeNextToken: LazyTokenizer;

  constructor(input: string) {
    this.computeNextToken = createLazyTokenizer(input);
  }

  consume(): Token {
    const token = this.lookahead();
    this.currentTokenPointer++;
    return token;
  }

  lookahead(): Token {
    if (this.currentTokenPointer === this.computedTokens.length) {
      this.computedTokens.push(this.computeNextToken());
    }
    return this.computedTokens[this.currentTokenPointer];
  }

  expect(tokenType: TokenType): Token {
    const token = this.consume();
    if (token.type === tokenType) {
      return token;
    }
    throw new Error(`Expected ${tokenType}`);
  }
}
