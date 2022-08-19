import * as tsutils from "tsutils";
import * as ts from "typescript";
import {
  TSESLint,
  AST_NODE_TYPES,
  TSESTree,
  ESLintUtils,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

type Options = [];

type MessageId = "floating";

export default createRule<Options, MessageId>({
  name: "no-floating-results",
  meta: {
    docs: {
      description: "Require .unwrap()-able objects to be handled appropriately",
      recommended: "error",
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      floating: "Results and Options must be handled.",
    },
    schema: [
      {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    ],
    type: "problem",
  },
  defaultOptions: [],

  create(context, []) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      ExpressionStatement(node): void {
        let expression = node.expression;

        if (expression.type === AST_NODE_TYPES.ChainExpression) {
          expression = expression.expression;
        }

        if (isUnhandledPromise(checker, expression)) {
          context.report({
            node,
            messageId: "floating",
          });
        }
      },
    };

    function isUnhandledPromise(
      checker: ts.TypeChecker,
      node: TSESTree.Node
    ): boolean {
      // First, check expressions whose resulting types may not be promise-like
      if (node.type === AST_NODE_TYPES.SequenceExpression) {
        // Any child in a comma expression could return a potentially unhandled
        // promise, so we check them all regardless of whether the final returned
        // value is promise-like.
        return node.expressions.some((item) =>
          isUnhandledPromise(checker, item)
        );
      }

      if (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === "void"
      ) {
        // Similarly, a `void` expression always returns undefined, so we need to
        // see what's inside it without checking the type of the overall expression.
        return isUnhandledPromise(checker, node.argument);
      }

      // Check the type. At this point it can't be unhandled if it isn't a promise
      if (
        !isPromiseLike(checker, parserServices.esTreeNodeToTSNodeMap.get(node))
      ) {
        return false;
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        // If the outer expression is a call, it must be either a `.then()` or
        // `.catch()` that handles the promise.
        return (
          !isPromiseCatchCallWithHandler(node) &&
          !isPromiseThenCallWithRejectionHandler(node) &&
          !isPromiseFinallyCallWithHandler(node)
        );
      } else if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        // We must be getting the promise-like value from one of the branches of the
        // ternary. Check them directly.
        return (
          isUnhandledPromise(checker, node.alternate) ||
          isUnhandledPromise(checker, node.consequent)
        );
      } else if (
        node.type === AST_NODE_TYPES.MemberExpression ||
        node.type === AST_NODE_TYPES.Identifier ||
        node.type === AST_NODE_TYPES.NewExpression
      ) {
        // If it is just a property access chain or a `new` call (e.g. `foo.bar` or
        // `new Promise()`), the promise is not handled because it doesn't have the
        // necessary then/catch call at the end of the chain.
        return true;
      }

      // We conservatively return false for all other types of expressions because
      // we don't want to accidentally fail if the promise is handled internally but
      // we just can't tell.
      return false;
    }
  },
});

// Modified from tsutils.isThenable() to only consider thenables which can be
// rejected/caught via a second parameter. Original source (MIT licensed):
//
//   https://github.com/ajafff/tsutils/blob/49d0d31050b44b81e918eae4fbaf1dfe7b7286af/util/type.ts#L95-L125
function isPromiseLike(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getTypeAtLocation(node);

  /*const stringType = checker.typeToString(type);*/
  /*
  const x = checker.typeToTypeNode(type, undefined, undefined);
  if (x) {
    (x as ts.TupleTypeNode).
  }
  (globalThis as any)["console"].log("e " + x?.getText(undefined));
*/
  for (const ty of tsutils.unionTypeParts(checker.getApparentType(type))) {
    //(globalThis as any)["console"].log(checker.typeToString(type));
    //(globalThis as any)["console"].log("sym" + type.getSymbol()?.getName());

    const then = ty.getProperty("unwrap");
    if (then !== undefined) {
      return true;
    }
  }
  return false;
}

function isPromiseCatchCallWithHandler(
  expression: TSESTree.CallExpression
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === "catch" &&
    expression.arguments.length >= 1
  );
}

function isPromiseThenCallWithRejectionHandler(
  expression: TSESTree.CallExpression
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === "then" &&
    expression.arguments.length >= 2
  );
}

function isPromiseFinallyCallWithHandler(
  expression: TSESTree.CallExpression
): boolean {
  return (
    expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    expression.callee.property.name === "finally" &&
    expression.arguments.length >= 1
  );
}
