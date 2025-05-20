module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn on usage of unknown types',
      category: 'Stylistic Issues',
      recommended: false,
    },
    schema: [], // no options
  },
  create(context) {
    return {
      TSTypeReference(node) {
        if (
          node.typeName &&
          node.typeName.type === 'Identifier' &&
          node.typeName.name === 'unknown'
        ) {
          context.report({
            node,
            message: 'Avoid using unknown type when possible',
          });
        }
      },
    };
  },
};
