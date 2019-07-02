'use babel';

export default {
  config: {
    "transformParentheses": {
      title: "Transform Parentheses",
      description: "Specifies whether Button[prop=(something)] should expand into \<Button prop={something}\>\</Button\>.",
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
      const spacesInBraces = atom.config.get("emmet-jsx-props-2.spacesInBraces");

      const transform = (item) => {
        // Determines whether there should be spaces around the expression in braces
        const replacementString = `$1={${spacesInBraces ? " " : ""}$2${spacesInBraces ? " " : ""}}`;

        // Transforms expressions in braces
        item.start = item.start.replace(/\b(\w+)="{([\w\d\.\(\)]+)}"/g, replacementString);

        // Transforms parenthetical expressions
        if (transformParentheses)
          item.start = item.start.replace(/\b(\w+)="\(([\w\d\.\(\)]+)\)"/g, replacementString);

        if (item.children.length > 0) {
          item.children.forEach(transform);
        }
      }

      filters.add('jsx-props', (tree) => {
        tree.children.forEach((item) => {
          transform(item);
        })
      })

      // Apply the jsx-props filter after the html filter so we can use string replacement
      emmet.loadSnippets({ "jsx": { "filters": "jsx, html, jsx-props" } })
    }
  }
}