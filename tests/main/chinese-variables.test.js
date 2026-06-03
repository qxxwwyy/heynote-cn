/**
 * Tests for Chinese variable name support in math.js engine.
 * 
 * Validates that the patched isValidLatinOrGreek regex correctly
 * recognizes CJK characters (U+4E00-U+9FFF, U+3400-U+4DBF, U+F900-U+FAFF)
 * as valid identifier characters.
 */

const math = require("../../public/math.js")

function createParser() {
    return math.parser()
}

function testEvaluate(parser, expr, expected, label) {
    try {
        const result = parser.evaluate(expr)
        const ok = typeof expected === "number"
            ? Math.abs(result - expected) < 1e-10
            : result === expected
        if (!ok) {
            throw new Error(
                `expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`
            )
        }
        return { pass: true, label, result }
    } catch (e) {
        return { pass: false, label, error: e.message }
    }
}

let passed = 0
let failed = 0

function assert(expr, expected, label) {
    const parser = createParser()
    const outcome = testEvaluate(parser, expr, expected, label)
    if (outcome.pass) {
        console.log(`  PASS: ${label}`)
        passed++
    } else {
        console.error(`  FAIL: ${label} — ${outcome.error}`)
        failed++
    }
}

// Sequential tests: same parser instance (variables persist)
function assertSeq(parser, expr, expected, label) {
    const outcome = testEvaluate(parser, expr, expected, label)
    if (outcome.pass) {
        console.log(`  PASS: ${label}`)
        passed++
    } else {
        console.error(`  FAIL: ${label} — ${outcome.error}`)
        failed++
    }
}

// --- Test suite: Chinese variable assignment ---
console.log("\n=== Chinese variable assignment ===")
assert("价格 = 100", 100, "价格 = 100")
assert("数量 = 5", 5, "数量 = 5")

// --- Test suite: Chinese variable reference ---
console.log("\n=== Chinese variable reference ===")
const p1 = createParser()
assertSeq(p1, "价格 = 100", 100, "步骤1: 价格 = 100")
assertSeq(p1, "数量 = 5", 5, "步骤2: 数量 = 5")
assertSeq(p1, "总价 = 价格 * 数量", 500, "步骤3: 总价 = 价格 * 数量")
assertSeq(p1, "折扣 = 0.8", 0.8, "步骤4: 折扣 = 0.8")
assertSeq(p1, "实付 = 总价 * 折扣", 400, "步骤5: 实付 = 总价 * 折扣")

// --- Test suite: Mixed Chinese+English variable names ---
console.log("\n=== Mixed Chinese+English variable names ===")
const p2 = createParser()
assertSeq(p2, "单价usd = 200", 200, "单价usd = 200")
assertSeq(p2, "数量 = 5", 5, "数量 = 5")
assertSeq(p2, "mixResult = 单价usd * 数量", 1000, "mixResult = 单价usd * 数量")
assertSeq(p2, "总a价 = 77", 77, "总a价 = 77")
assertSeq(p2, "合计 = 单价usd + 总a价", 277, "合计 = 单价usd + 总a价")

// --- Test suite: Underscore + Chinese ---
console.log("\n=== Underscore + Chinese ===")
const p3 = createParser()
assertSeq(p3, "_价格 = 99", 99, "_价格 = 99")
assertSeq(p3, "__内部 = 42", 42, "__内部 = 42")

// --- Test suite: Chinese with trailing digits ---
console.log("\n=== Chinese with trailing digits ===")
const p4 = createParser()
assertSeq(p4, "变量1 = 10", 10, "变量1 = 10")
assertSeq(p4, "变量2 = 20", 20, "变量2 = 20")
assertSeq(p4, "合计 = 变量1 + 变量2", 30, "合计 = 变量1 + 变量2")

// --- Test suite: Complex expressions with Chinese variables ---
console.log("\n=== Complex expressions ===")
const p5 = createParser()
assertSeq(p5, "价格 = 100", 100, "setup: 价格 = 100")
assertSeq(p5, "数量 = 3", 3, "setup: 数量 = 3")
assertSeq(p5, "单价usd = 200", 200, "setup: 单价usd = 200")
assertSeq(p5, "总费用 = 价格 * 数量 + 单价usd * 数量", 900, "总费用 = 价格 * 数量 + 单价usd * 数量")

// --- Test suite: Built-in functions still work ---
console.log("\n=== Built-in functions with Chinese context ===")
const p6 = createParser()
assertSeq(p6, "半径 = 10", 10, "半径 = 10")
assertSeq(p6, "面积 = 3.14159 * 半径^2", 314.159, "面积 = π * 半径²")
assertSeq(p6, "side = 3", 3, "side = 3")
assertSeq(p6, "对角线 = sqrt(side^2 + side^2)", 4.242640687119285, "对角线 = sqrt(2*side²)")
assertSeq(p6, "角度 = round(对角线)", 4, "角度 = round(对角线)")

// --- Test suite: English variables still work (regression) ---
console.log("\n=== English variables (regression) ===")
const p7 = createParser()
assertSeq(p7, "x = 42", 42, "x = 42")
assertSeq(p7, "y = x * 2", 84, "y = x * 2")
assertSeq(p7, "result = sqrt(x + y)", 11.224972160321824, "result = sqrt(x + y)")
assertSeq(p7, "PI_check = 3.14159", 3.14159, "PI_check = 3.14159")

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
process.exit(failed > 0 ? 1 : 0)
