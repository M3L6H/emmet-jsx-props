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
      description: "Specifies whether `'Button[prop=(something)]'` should expand into a JSX property.",
      type: "boolean",
      default: true
    },
    "transformBackticks": {
      title: "Transform Backticks",
      description: "Specifies whether ``'Button[prop=`something`]'`` should expand into a JSX property.",
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

      const transformParentheses = atom.config.get("emmet-jsx-props-2.transformParentheses");
      const transformBackticks = atom.config.get("emmet-jsx-props-2.transformBackticks");
      const spacesInBraces = atom.config.get("emmet-jsx-props-2.spacesInBraces");
      const expandLambdas = atom.config.get("emmet-jsx-props-2.expandLambdas");

      // Regular rexpressions
      const reBrackets = /\b(\w+)=[{\(](\([ ,{}\d\w]*\) ?=> ?[ {};\(\)\.\w\d]*)[}\)]/;
      const reBackticks = /\b(\w+)=(`[ ${}\w\d\.\(\)]+`)/;
      const reBackticksQuotes = /\b(\w+)=["'](`[ ${}\w\d\.\(\)]+`)["']/;
      const reLambdaQuotes = /\b(\w+)=["'](\([ ,{}\d\w]*\) ?=> ?[ {};\(\)\.\w\d]*)["']/;
      const reQuotesG = /\b(\w+)="(\([ ,{}\d\w]*\) ?=> ?[ {};\(\)\.\w\d]*)"/g;

      // Identify and surround lambda expressions with quotes so Emmet ignores them
      const escapeWithQuotes = (tree) => {
        if (typeof tree !== undefined) {
          console.log(tree);

          if (expandLambdas)
            tree[0].abbreviation = tree[0].abbreviation.replace(reBrackets, "$1=\"$2\"");

          if (transformBackticks)
            tree[0].abbreviation = tree[0].abbreviation.replace(reBackticks, "$1=\"$2\"");

          const abrv = tree[0].abbreviation;
          const result = abrv.includes("`") ? abrv.match(reBackticksQuotes) : abrv.match(reLambdaQuotes);
          const name = (result === null) ? "" : result[1];
          const value = (result === null) ? "" : result[2];

          // We are dealing with a lambda function, so update the attributes
          if ((expandLambdas && value.includes("=>")) || (transformBackticks && value.includes("`"))) {
            // Add the corrected attribute
            const index = tree[0]._attributes.findIndex((elt) => (elt.name === name));
            tree[0]._attributes[index] = { name: name, value: value };

            // Remove the incorrect attributes added by emmet
            tree[0]._attributes = tree[0]._attributes.filter((elt) => !(elt.name === "" || value.includes(elt.name)));
          }
        }
      };

      const transform = (item) => {
        if (typeof item !== undefined) {
          // Determines whether there should be spaces around the expression in braces
          const replacementString = `$1={${spacesInBraces ? " " : ""}$2${spacesInBraces ? " " : ""}}`;

          // Transforms expressions in braces
          item.start = item.start.replace(/\b(\w+)="{([\w\d\.\(\)]+)}"/g, replacementString);

          // Transforms parenthetical expressions
          if (transformParentheses)
            item.start = item.start.replace(/\b(\w+)="\(([\w\d\.\(\)]+)\)"/g, replacementString);

          // Transforms backtick expressions
          if (transformBackticks)
            item.start = item.start.replace(/\b(\w+)="(`[ ${}\w\d\.\(\)]+`)"/g, replacementString);

          // Transforms lambda expressions
          if (expandLambdas)
            item.start = item.start.replace(reQuotesG, replacementString);

          if (item.children.length > 0) {
            item.children.forEach(transform);
          }
        }
      };

      filters.add('jsx-props-2', (tree) => {
        if (typeof tree !== undefined) {
          tree.children.forEach((item) => {
            transform(item);
          });
        }

        return tree;
      });

      const lambdaFilter = (tree) => {
        if (typeof tree !== undefined) {
          tree.children.forEach((item, index, innerTree) => {
            escapeWithQuotes(innerTree);
          });
        }

        return tree;
      };

      // A filter that runs before-hand to escape lambda expressions
      filters.add("jsx-props-2-escapes", lambdaFilter);

      // Apply the jsx-props filter after the html filter so we can use string replacement
      // The lambda filter comes before the html filter to escape lambda expressions with quotes
      emmet.loadSnippets({ "jsx": { "filters": "jsx-props-2-escapes, jsx, html, jsx-props-2" } });
    }
  }
}