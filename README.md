# emmet-jsx-props package

Atom package to extend Emmet's JSX expansions to convert string attributes to js props. Forked from [iJigg's package](https://github.com/iJigg/emmet-jsx-props). Behavior is slightly altered.

- `Button[prop=myProp]`, `Button[prop="myProp"]`, and `Button[prop='myProp']` expand into `<Button prop="myProp"></Button>` which is default Emmet behavior
- `Button[prop={myJSXProp}]` expands into `<Button prop={myJSXProp}></Button>`
- If enabled, `Button[prop=(() => {})]` expands into `<Button prop={() => {}}></Button>`
