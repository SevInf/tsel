import { test, expect } from "vitest";
import { expression, type ExpressionTree } from "./expressionTree";

type Product = {
  id: string;
  quantity: number;
  unitPrice: number;
};

test("single field reference", () => {
  expect(expression((row: Product) => row.quantity)).toMatchInlineSnapshot(`
    {
      "expression": {
        "kind": "ColumnReference",
        "name": "quantity",
      },
      "variables": [],
    }
  `);
});

test("with extra variable", () => {
  expect(
    expression(
      (product: Product, maxQuantity) => product.quantity > maxQuantity,
      1000
    )
  ).toMatchInlineSnapshot(`
    {
      "expression": {
        "kind": "BinaryExpression",
        "left": {
          "kind": "ColumnReference",
          "name": "quantity",
        },
        "operator": ">",
        "right": {
          "index": 1,
          "kind": "VarReference",
        },
      },
      "variables": [
        1000,
      ],
    }
  `);
});

test("complex expression", () => {
  expect(
    expression(
      (product: Product, maxTotal) =>
        product.quantity * product.unitPrice > maxTotal,
      1000
    )
  ).toMatchInlineSnapshot(`
    {
      "expression": {
        "kind": "BinaryExpression",
        "left": {
          "kind": "BinaryExpression",
          "left": {
            "kind": "ColumnReference",
            "name": "quantity",
          },
          "operator": "*",
          "right": {
            "kind": "ColumnReference",
            "name": "unitPrice",
          },
        },
        "operator": ">",
        "right": {
          "index": 1,
          "kind": "VarReference",
        },
      },
      "variables": [
        1000,
      ],
    }
  `);
});
