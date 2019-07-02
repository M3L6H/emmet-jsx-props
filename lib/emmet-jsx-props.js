'use babel';

export default {
  config: {
    "ignoreExplicitStrings": {
      title: "Ignore Explicit Strings",
      description: "Will avoid converting explicitly defined strings (i.e. Button[class=\"MyClass\"]) into JSX properties.",
      type: "boolean",
      default: true
    }
  },
  activate(state) {
    if (atom.packages.isPackageLoaded('emmet')) {
      const pkgDir = path.resolve(atom.packages.resolvePackagePath('emmet'), 'node_modules', 'emmet', 'lib');
      const emmet = require(path.join(pkgDir, 'emmet'));
      const filters = require(path.join(pkgDir, 'filter', 'main'));

      const ignoreExplicitStrings = atom.config.get("ignoreExplicitStrings");

      const transform = (item) => {
        //if (ignoreExplicitStrings === true) {
        item.start = item.start.replace(/\b(\w+)=([\w\d\.\(\)]+)/g, "$1={$2}");
        // } else {
        //   item.start = item.start.replace(/\b(\w+)="([\w\d\.\(\)]+)"/g, "$1={$2}");
        // }

        if (item.children.length > 0) {
          item.children.forEach(transform);
        }
      }

      filters.add('jsx-props', (tree) => {
        tree.children.forEach((item) => {
          transform(item);
        })
      })

      // Apply jsx-props after html so we can use a simple string replacement
      emmet.loadSnippets({ "jsx": { "filters": "jsx, html, jsx-props" } })
    }
  }
}