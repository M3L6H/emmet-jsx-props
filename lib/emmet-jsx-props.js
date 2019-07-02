'use babel';

export default {
  config: {
    "expandLambdas": {
      title: "Expand Arrow Functions",
      description: "Determines whether lambda expressions should be expanded.",
      type: "boolean",
      default: true
    },
    "transformParentheses": {
      title: "Transform Parentheses",
      description: "Specifies whether 'Button[prop=(something)]' should expand into a JSX property.",
      type: "boolean",
      default: true
    },
    "spacesInBraces": {
      title: "Add Spaces in Braces",
      description: "If true, spaces are put on either side of the expression in the braces.",
      type: "boolean",
      default: false
    }
  },
  activate(state) {
    if (atom.packages.isPackageLoaded('emmet')) {
      const pkgDir = path.resolve(atom.packages.resolvePackagePath('emmet'), 'node_modules', 'emmet', 'lib');
      const emmet = require(path.join(pkgDir, 'emmet'));
      const filters = require(path.join(pkgDir, 'filter', 'main'));

      const transformParentheses = atom.config.get("emmet-jsx-props-2.transformParentheses") || true;
      const spacesInBraces = atom.config.get("emmet-jsx-props-2.spacesInBraces") || false;
      const expandLambdas = atom.config.get("emmet-jsx-props-2.expandLambdas") || true;

      // Identify and surround lambda expressions with quotes so Emmet ignores them
      const escapeLambda = (item) => {
        if (typeof item !== undefined) {
          if (expandLambdas)
            item.start = item.start.replace(/\b(\w+)=[{\(](\([ ,{}\d\w]+\) ?=> ?[ {};\(\)\.\w\d]+)[}\)]/g, "$1=\"$2\"");

          if (item.children.length > 0) {
            item.children.forEach(escapeLambda);
          }
        }
      };

      const transform = (item) => {
        // Determines whether there should be spaces around the expression in braces
        const replacementString = `$1={${spacesInBraces ? " " : ""}$2${spacesInBraces ? " " : ""}}`;

        // Transforms expressions in braces
        item.start = item.start.replace(/\b(\w+)="{([\w\d\.\(\)]+)}"/g, replacementString);

        // Transforms parenthetical expressions
        if (transformParentheses)
          item.start = item.start.replace(/\b(\w+)="\(([\w\d\.\(\)]+)\)"/g, replacementString);

        // Transforms lambda expressions
        if (expandLambdas)
          item.start = item.start.replace(/\b(\w+)="(\([ ,{}\d\w]+\) ?=> ?[ {};\(\)\.\w\d]+)"/g, replacementString);

        if (item.children.length > 0) {
          item.children.forEach(transform);
        }
      };

      filters.add('jsx-props-2', (tree) => {
        tree.children.forEach((item) => {
          transform(item);
        })
      });

      // A filter that runs before-hand to escape lambda expressions
      filters.add("jsx-props-2-lambdas", (tree) => {
          if (typeof tree !== undefined) {
            tree.children.forEach((item) => {
                escapeLambda(item);
              }
            }
          })
      });

    // Apply the jsx-props filter after the html filter so we can use string replacement
    // The lambda filter comes before the html filter to escape lambda expressions with quotes
    emmet.loadSnippets({ "jsx": { "filters": "jsx, jsx-props-2-lambdas, html, jsx-props-2" } });
  }
}
}