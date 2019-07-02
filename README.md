# Emmet JSX Props 2 Package

Atom package to extend Emmet's JSX expansions to convert string attributes to js props. Forked from [iJigg's package](https://github.com/iJigg/emmet-jsx-props). Behavior is slightly altered.

- `Button[prop=myProp]`, `Button[prop="myProp"]`, and `Button[prop='myProp']` expand into `<Button prop="myProp"></Button>` which is default Emmet behavior
- `Button[prop={myJSXProp}]` expands into `<Button prop={myJSXProp}></Button>`
- If enabled, will also expand `Button[prop=(myJSXProp)]` into `<Button prop={myJSXProp}></Button>`
- Lastly, `Button[arrfunc={(param1, param2, param3) => {expr1; expr2; expr3;}}]` expands into `<Button arrfunc={(param1, param2, param3) => {expr1; expr2; expr3;}}></Button>`
 - Note that multi-line arrow function expansion is **not** supported
