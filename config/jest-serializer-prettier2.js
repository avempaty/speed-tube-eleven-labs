const prettier = require("prettier-2")

module.exports = {
  print(val, serialize) {
    console.log("yo!", arguments)
    const formatted = prettier.format(val, {
      ...require("./prettier-2.config"), // Load Prettier 2 config
      parser: "babel-ts", // Or whichever parser is appropriate
    })

    return serialize(formatted)
  },
  test(val) {
    return val
  },
}
