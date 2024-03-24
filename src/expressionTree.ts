import { parse } from "./parser";
import type * as ast from "./ast";

export type ExpressionTree<RowType> = {
  [s: symbol]: RowType;
  variables: unknown[];
  expression: Expression;
};

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | VarReference
  | ColumnReference;

export type BinaryExpression = {
  kind: "BinaryExpression";
  operator: ast.BinaryOperator["operator"];
  left: Expression;
  right: Expression;
};

export type UnaryExpression = {
  kind: "UnaryExpression";
  operator: "+" | "-";
  operand: Expression;
};

export type VarReference = {
  kind: "VarReference";
  index: number;
};

export type ColumnReference = {
  kind: "ColumnReference";
  name: string;
};

export function expression<RowType, Args extends unknown[]>(
  fn: (row: RowType, ...args: Args) => unknown,
  ...args: Args
): ExpressionTree<RowType> {
  const abstractTree = parse(Function.prototype.toString.call(fn));
  return toConcreteTree(abstractTree, args);
}

type ScopeEntry = { kind: "var"; index: number } | { kind: "row" };
type Scope = Map<string, ScopeEntry>;

function toConcreteTree(
  abstractTree: ast.AbstractExpressionTree,
  args: unknown[]
): ExpressionTree<any> {
  const scope = createScope(abstractTree.bindings);
  return {
    variables: args,
    expression: convertAbstractNode(abstractTree.body, scope),
  };
}

function convertAbstractNode(node: ast.Expression, scope: Scope): Expression {
  switch (node.kind) {
    case "BinaryOperator":
      return {
        kind: "BinaryExpression",
        operator: node.operator,
        left: convertAbstractNode(node.left, scope),
        right: convertAbstractNode(node.right, scope),
      };
    case "UnaryOperator":
      return {
        kind: "UnaryExpression",
        operator: node.operator,
        operand: convertAbstractNode(node.operand, scope),
      };
    case "Identifier": {
      const varDesc = scope.get(node.name);
      if (varDesc === undefined) {
        throw new Error(`Undefined varaible: ${node.name}`);
      }

      if (varDesc.kind !== "var") {
        throw new Error("Identifier refers to non-varable");
      }
      return {
        kind: "VarReference",
        index: varDesc.index,
      };
    }

    case "PropertyAccess": {
      const object = node.object;
      if (object.kind !== "Identifier") {
        throw new Error("not supported");
      }
      const varDesc = scope.get(object.name);
      if (!varDesc) {
        throw new Error(`Undefined varaiable: ${object.name}`);
      }

      if (varDesc.kind !== "row") {
        throw new Error("Can not use property access on a thing");
      }

      return {
        kind: "ColumnReference",
        name: node.property.name,
      };
    }
    case "FunctionCall": {
      throw new Error("unimplemented");
    }
  }
}

function createScope(bindings: ast.Identifier[]): Scope {
  const scope: Scope = new Map();
  if (bindings.length === 0) {
    return scope;
  }
  scope.set(bindings[0].name, { kind: "row" });
  for (let i = 1; i < bindings.length; i++) {
    scope.set(bindings[i].name, { kind: "var", index: i });
  }
  return scope;
}
