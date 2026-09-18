import type { InputVariable } from "../../src/types";

export interface TestCases {
  expression: string;
  context?: Record<string, unknown>;
  description?: string;
  expected?: {
    inputs?: InputVariable[];
  };
}

export const testCases: TestCases[] = [
  {
    expression: "firstName + lastName",
    description: "Unknown type without context",
    expected: {
      inputs: [
        { name: "firstName" },
        { name: "lastName" },
      ],
    },
  },
  {
    expression: 'firstName + " " + lastName',
    description: "String type from literal - Variables inferred as strings",
    expected: {
      inputs: [
        { name: "firstName", type: "String" },
        { name: "lastName", type: "String" },
      ],
    },
  },
  {
    expression: "age + 5 + offset",
    description: "Number type from literal - Variables inferred as numbers",
    expected: {
      inputs: [
        { name: "age", type: "Number" },
        { name: "offset", type: "Number" },
      ],
    },
  },
  {
    expression: "user.name + user.email",
    description: "Context type - Detects accessed properties (name, email)",
    expected: {
      inputs: [
        {
          name: "user",
          type: "Context",
          entries: [
            { name: "email" },
            { name: "name" },
          ],
        },
      ],
    },
  },
  {
    expression: "products[item.price > 100 and item.inStock]",
    description: "List type - Detects item structure (price, inStock)",
    expected: {
      inputs: [
        { name: "products", type: "List" },
      ],
    },
  },
  {
    expression: "x > 5",
    description: "Number from comparison - Comparison suggests numeric type",
    expected: {
      inputs: [
        { name: "x", type: "Number" },
      ],
    },
  },
  {
    expression: "x + y",
    description: "Unknown type - Could be string or number without literals",
    expected: {
      inputs: [
        { name: "x" },
        { name: "y" },
      ],
    },
  },
  {
    expression: "[ {x: 1}, {x: 2}, {x:3}][item.x>2]",
    description: "Filter on literal - 'item' is implicit, no external inputs",
    expected: {
      inputs: [],
    },
  },
  {
    expression: "[ {x: 1}, {x: 2}, {x:3}][x>y]",
    description:
      "Filter with external variable - Detects 'y' as external input",
    expected: {
      inputs: [
        { name: "y" },
      ],
    },
  },
  {
    expression: "list[x>2]",
    description: "Filter on variable - 'list' required; 'x' is item property",
    expected: {
      inputs: [
        { name: "list", type: "List", entries: [{ name: "x" }] },
      ],
    },
  },
  {
    expression: "list[item.x>2]",
    description: "Filter on variable item path - 'list' item property tracked",
    expected: {
      inputs: [
        { name: "list", type: "List", entries: [{ name: "x" }] },
      ],
    },
  },

  {
    expression: "a + b.c",
    description: "Mixed paths - Simple variable 'a' and path 'b.c'",
    expected: {
      inputs: [
        { name: "a" },
        {
          name: "b",
          type: "Context",
          entries: [
            { name: "c" },
          ],
        },
      ],
    },
  },
  {
    expression: "{a: {b: c}}.a.b",
    description: "Literal context path - Only 'c' is external",
    expected: {
      inputs: [
        { name: "c" },
      ],
    },
  },
  {
    expression: 'fromAi(toolCall.yearlyIncome, "prompt", "number")',
    description: "Function arguments - Detects nested path in arguments",
    expected: {
      inputs: [
        { name: "fromAi" },
        {
          name: "toolCall",
          type: "Context",
          entries: [
            { name: "yearlyIncome" },
          ],
        },
      ],
    },
  },

  {
    expression: "{ a: 1, b: a + c }",
    description: "Local scoping - 'a' is local, only 'c' is external",
    expected: {
      inputs: [
        { name: "c" },
      ],
    },
  },
  {
    expression: '{ db: db, user: "postgres" }',
    description: "Context with external variable - Detects 'db' input",
    expected: {
      inputs: [
        { name: "db" },
      ],
    },
  },
  {
    expression: "{ a: 1, b: 2, c: 3 }",
    description: "Context output - Returns context with keys a, b, c",
    expected: {
      inputs: [],
    },
  },
  {
    expression: "[1, 2, 3]",
    description: "List output - Returns a list",
    expected: {
      inputs: [],
    },
  },
  {
    expression: "5 + 10",
    description: "Number output - Returns numeric result",
    expected: {
      inputs: [],
    },
  },
  {
    expression: '"hello" + "world"',
    description: "String output - Returns string result",
    expected: {
      inputs: [],
    },
  },
  {
    expression: '5 + "hello"',
    description: "Mixed literals - Ambiguous type (number + string)",
    expected: {
      inputs: [],
    },
  },
  {
    expression: '"text {{variable}}"',
    description: "String interpolation - Variables in strings ignored",
    expected: {
      inputs: [],
    },
  },
  {
    expression: "x + y",
    context: { x: "hello", y: "world" },
    description: "Context inference - Output type inferred from context values",
    expected: {
      inputs: [
        { name: "x" },
        { name: "y" },
      ],
    },
  },
  {
    expression: `{
  user: { name: user.name, email: user_email }
}.user`,
    description:
      "Nested context with path access - Detects user.name and user_email",
    expected: {
      inputs: [
        {
          name: "user",
          type: "Context",
          entries: [
            { name: "name" },
          ],
        },
        { name: "user_email" },
      ],
    },
  },
  {
    expression: "for i in [1,2,3] return i + x + 9",
    description: "For expression - Local variable 'i' in iteration",
    expected: {
      inputs: [
        { name: "x", type: "Number" },
      ],
    },
  },
  {
    expression: "some x in [1,2,3] satisfies x > y",
    description:
      "Quantified expression (some) - Local variable 'x' in condition",
    expected: {
      inputs: [
        { name: "y" },
      ],
    },
  },
  {
    expression: "every x in list satisfies x > 0",
    description:
      "Quantified expression (every) - 'x' is local, 'list' is external",
    expected: {
      inputs: [
        { name: "list" },
      ],
    },
  },
  {
    expression: "function(a, b) a + b + c",
    description:
      "Function definition - Parameters 'a' and 'b' are local, 'c' is external",
    expected: {
      inputs: [
        { name: "c" },
      ],
    },
  },
  {
    expression: "for x in list1, y in list2 return x + y + z",
    description:
      "For expression with multiple variables - 'x' and 'y' are local",
    expected: {
      inputs: [
        { name: "list1" },
        { name: "list2" },
        { name: "z" },
      ],
    },
  },
  {
    expression: "if condition then x else y",
    description: "If expression - All variables are external",
    expected: {
      inputs: [
        { name: "condition" },
        { name: "x" },
        { name: "y" },
      ],
    },
  },
];
