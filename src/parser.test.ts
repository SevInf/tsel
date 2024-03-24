import { expect, test } from "vitest";
import { parse } from "./parser";

test("identifier", () => {
  expect(parse("(foo) => foo")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "foo",
        },
      ],
      "body": {
        "kind": "Identifier",
        "name": "foo",
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("property access", () => {
  expect(parse("(db) => db.col")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "db",
        },
      ],
      "body": {
        "kind": "PropertyAccess",
        "object": {
          "kind": "Identifier",
          "name": "db",
        },
        "property": {
          "kind": "Identifier",
          "name": "col",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("nested property access", () => {
  expect(parse("(user) => user.name.first")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "user",
        },
      ],
      "body": {
        "kind": "PropertyAccess",
        "object": {
          "kind": "PropertyAccess",
          "object": {
            "kind": "Identifier",
            "name": "user",
          },
          "property": {
            "kind": "Identifier",
            "name": "name",
          },
        },
        "property": {
          "kind": "Identifier",
          "name": "first",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("unary plus", () => {
  expect(parse("(foo) => +foo")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "foo",
        },
      ],
      "body": {
        "kind": "UnaryOperator",
        "operand": {
          "kind": "Identifier",
          "name": "foo",
        },
        "operator": "+",
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("unary minus", () => {
  expect(parse("(foo) => -foo")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "foo",
        },
      ],
      "body": {
        "kind": "UnaryOperator",
        "operand": {
          "kind": "Identifier",
          "name": "foo",
        },
        "operator": "-",
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("addition", () => {
  expect(parse("(a, b) => a + b")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "a",
        },
        {
          "kind": "Identifier",
          "name": "b",
        },
      ],
      "body": {
        "kind": "BinaryOperator",
        "left": {
          "kind": "Identifier",
          "name": "a",
        },
        "operator": "+",
        "right": {
          "kind": "Identifier",
          "name": "b",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("multiplication", () => {
  expect(parse("(a, b) => a * b")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "a",
        },
        {
          "kind": "Identifier",
          "name": "b",
        },
      ],
      "body": {
        "kind": "BinaryOperator",
        "left": {
          "kind": "Identifier",
          "name": "a",
        },
        "operator": "*",
        "right": {
          "kind": "Identifier",
          "name": "b",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("subtraction", () => {
  expect(parse("(a, b) => a - b")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "a",
        },
        {
          "kind": "Identifier",
          "name": "b",
        },
      ],
      "body": {
        "kind": "BinaryOperator",
        "left": {
          "kind": "Identifier",
          "name": "a",
        },
        "operator": "-",
        "right": {
          "kind": "Identifier",
          "name": "b",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("division", () => {
  expect(parse("(a, b) => a / b")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "a",
        },
        {
          "kind": "Identifier",
          "name": "b",
        },
      ],
      "body": {
        "kind": "BinaryOperator",
        "left": {
          "kind": "Identifier",
          "name": "a",
        },
        "operator": "/",
        "right": {
          "kind": "Identifier",
          "name": "b",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});

test("priority: multiplicative over additive", () => {
  expect(parse("(a, b, c) => a * b + c")).toMatchInlineSnapshot(`
    {
      "bindings": [
        {
          "kind": "Identifier",
          "name": "a",
        },
        {
          "kind": "Identifier",
          "name": "b",
        },
        {
          "kind": "Identifier",
          "name": "c",
        },
      ],
      "body": {
        "kind": "BinaryOperator",
        "left": {
          "kind": "BinaryOperator",
          "left": {
            "kind": "Identifier",
            "name": "a",
          },
          "operator": "*",
          "right": {
            "kind": "Identifier",
            "name": "b",
          },
        },
        "operator": "+",
        "right": {
          "kind": "Identifier",
          "name": "c",
        },
      },
      "kind": "AbstractExpressionTree",
    }
  `);
});
