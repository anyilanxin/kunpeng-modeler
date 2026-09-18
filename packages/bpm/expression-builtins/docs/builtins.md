# 表达式内置方法说明文档（FEEL Builtins）

> 本文档由 `src/kunpengBuiltins.js` 自动生成的内置方法整理而成，按类别（category）组织。该源文件由
> `npm run update-builtins`（即 `pull-docs` + `compile-builtins`）任务自动生成， **请勿直接修改源文件**
> ，如需调整请编辑模板并重新生成。

## 模块导出（Exports）

`@kunpeng/expression-builtins` 导出以下四个集合：

| 导出名                        | 说明                                                                                   |
|-------------------------------|----------------------------------------------------------------------------------------|
| `qlexpressionBuiltins`        | 标准 FEEL 内置函数列表（不含 Camunda/Kunpeng 扩展）。                                  |
| `kunpengExtensions`           | Kunpeng（Camunda）扩展函数列表。                                                       |
| `kunpengBuiltins`             | Kunpeng Scala FEEL 内置方法的合集：`[...qlexpressionBuiltins, ...kunpengExtensions]`。 |
| `kunpengReservedNameBuiltins` | 名称中包含保留关键字、需要注入到 parser context 的函数（当前仅 `getOrElse`）。         |

每个内置方法的条目结构（`Builtin` 类型）：

```ts
{
  name: string;                 // 函数名
  type?: 'function';
  params?: Array<{ name: string }>;  // 形参列表
  info: string;                 // HTML 形式的说明文本（含签名与示例）
  engines?: Record<string, string>; // 引擎版本约束，如 { kunpeng: '>=8.3' }
}
```

> 说明：标注 **`🧩 Kunpeng Extension`** 的函数为扩展函数；标注 **`>= x.x`** 的表示需要对应 Kunpeng
> 引擎版本及以上。

---

## 目录

- [一、布尔与逻辑（Boolean / Logic）](#一布尔与逻辑boolean--logic)
- [二、Context（上下文）](#二context上下文)
- [三、类型转换（Conversion）](#三类型转换conversion)
- [四、日期时间（Date / Time / DateTime / Duration）](#四日期时间date--time--datetime--duration)
- [五、JSON](#五json)
- [六、List（列表）](#六list列表)
- [七、数值与数学（Number / Math）](#七数值与数学number--math)
- [八、数值舍入（Rounding）](#八数值舍入rounding)
- [九、区间关系（Range / Temporal Comparison）](#九区间关系range--temporal-comparison)
- [十、字符串（String）](#十字符串string)
- [十一、Kunpeng 扩展函数](#十一kunpeng-扩展函数)
- [十二、保留关键字函数（Reserved Name）](#十二保留关键字函数reserved-name)

---

## 一、布尔与逻辑（Boolean / Logic）

### `not(negand)`

返回给定布尔值的逻辑非。

```feel
not(true)   // false
not(null)   // null
```

### `in(negand)`

返回给定布尔值的逻辑非（与 `not` 同义）。

```feel
in(true)    // true
in(null)    // null
```

### `all(list)`

若列表中任一元素为 `false` 则返回 `false`，否则返回 `true`。空列表返回 `true`。参数可作为列表或元素序列传入。

```feel
all([true, false])    // false
all(false, null, true) // false
```

> ℹ️ 该函数取代了旧函数 `and()`，旧函数已废弃。

### `any(list)`

若列表中任一元素为 `true` 则返回 `true`，否则返回 `false`。空列表返回 `false`。参数可作为列表或元素序列传入。

```feel
any([false, true])     // true
any(false, null, true) // true
```

> ℹ️ 该函数取代了旧函数 `or()`，旧函数已废弃。

---

## 二、Context（上下文）

### `getValue(context, key)`

返回 context 中指定 key 的值。

```feel
getValue({foo: 123}, "foo")   // 123
getValue({a: 1}, "b")         // null
```

### `getValue(context, keys)` 🧩 Kunpeng Extension

按 `keys` 路径返回嵌套 context 中的值。`keys` 为空或路径不存在时返回 `null`。

```feel
getValue({x:1, y: {z:0}}, ["y", "z"])   // 0
getValue({x: {y: {z:0}}}, ["x", "y"])   // {z:0}
getValue({a: {b: 3}}, ["b"])            // null
```

### `getEntries(context)`

将 context 的所有条目作为 `[{key, value}]` 列表返回。

```feel
getEntries({foo: 123})   // [{key: "foo", value: 123}]
```

### `context(context)`

根据 key-value 列表构造 context，是 `getEntries()` 的反向函数。

```feel
context([{"key":"a", "value":1}, {"key":"b", "value":2}])   // {a:1, b:2}
```

### `contextPut(context, keys, value)`

按 `keys` 路径向 context 添加新条目并返回新 context。 `keys=[k1,k2]` 表示添加 `k1.k2 = value`；同名
key 会覆盖；`keys` 为空返回 `null`。

```feel
contextPut({x:1}, ["y"], 2)              // {x:1, y:2}
contextPut({x:1, y: {z:0}}, ["y", "z"], 2)  // {x:1, y: {z:2}}
contextPut({x:1}, ["y", "z"], 2)         // {x:1, y: {z:2}}
```

### `contextPut(context, key, value)`

单 key 形式：向 context 添加/覆盖单个 key，返回新 context。

```feel
contextPut({x:1}, "y", 2)   // {x:1, y:2}
```

> ℹ️ 该函数取代了旧扩展函数 `put()`，旧函数已废弃。

### `contextMerge(contexts)` 🧩 Kunpeng Extension `>=8.2`

合并多个 context，返回包含所有条目的新 context；同名 key 按列表顺序覆盖。

```feel
contextMerge([{x:1}, {y:2}])          // {x:1, y:2}
contextMerge([{x:1, y: 0}, {y:2}])    // {x:1, y:2}
```

> ℹ️ 该函数取代了旧扩展函数 `put all()`，旧函数已废弃。

---

## 三、类型转换（Conversion）

### `string(from)`

将给定值转换为字符串表示。

```feel
string(1.1)                 // "1.1"
string(date("2012-12-25"))  // "2012-12-25"
```

### `number(from)`

将字符串解析为数字，无法解析时返回 `null`。

```feel
number("1500.5")   // 1500.5
```

### `number(from, grouping separator)`

使用指定的分组分隔符将字符串解析为数字。

```feel
number("1,500", ",")   // 1500
```

### `number(from, grouping separator, decimal separator)`

使用指定的分组分隔符与小数分隔符将字符串解析为数字。

```feel
number("1 500.5", " ", ".")   // 1500.5
```

---

## 四、日期时间（Date / Time / DateTime / Duration）

### `date(from)`

从字符串或 date-time 中提取日期。无效日期（如 `"2024-06-31"`）返回 `null`。

```feel
date("2018-04-29")                          // date("2018-04-29")
date(dateTime("2012-12-25T11:00:00"))       // date("2012-12-25")
```

### `date(year, month, day)`

根据年/月/日分量构造日期。

```feel
date(2012, 12, 25)   // date("2012-12-25")
```

### `time(from)`

从字符串或 date-time 中提取时间。

```feel
time("12:00:00")                            // time("12:00:00")
time(dateTime("2012-12-25T11:00:00"))       // time("11:00:00")
```

### `time(hour, minute, second)`

根据时分秒构造时间。

```feel
time(23, 59, 0)   // time("23:59:00")
```

### `time(hour, minute, second, offset)`

根据时分秒与时区偏移构造时间。

```feel
time(14, 30, 0, duration("PT1H"))   // time("14:30:00+01:00")
```

### `dateTime(from)`

将字符串解析为 date-time，支持 `YYYY-MM-DDThh:mm:ss` 及偏移/IANA 时区/二者组合。无效日期返回 `null`。

```feel
dateTime("2018-04-29T09:30:00")                            // dateTime("2018-04-29T09:30:00")
dateTime("2018-04-29T09:30:00+02:00")                      // dateTime("2018-04-29T09:30:00+02:00")
dateTime("2018-04-29T09:30:00@Europe/Berlin")              // dateTime("2018-04-29T09:30:00@Europe/Berlin")
dateTime("2018-04-29T09:30:00+02:00[Europe/Berlin]")       // dateTime("2018-04-29T09:30:00@Europe/Berlin")
```

### `dateTime(date, time)`

由 date 与 time 分量组合成 date-time。

```feel
dateTime(date("2012-12-24"), time("T23:59:00"))                 // dateTime("2012-12-24T23:59:00")
dateTime(dateTime("2012-12-25T11:00:00"), time("T23:59:00"))    // dateTime("2012-12-25T23:59:00")
```

### `dateTime(date, timezone)` 🧩 Kunpeng Extension

返回给定 date-time 在指定时区下的本地时间（若时区不同会做调整）。

```feel
dateTime(@"2020-07-31T14:27:30@Europe/Berlin", "America/Los_Angeles")
// dateTime("2020-07-31T05:27:30@America/Los_Angeles")

dateTime(@"2020-07-31T14:27:30", "Z")
// dateTime("2020-07-31T12:27:30Z")
```

### `duration(from)`

将字符串解析为时长（days-time 或 years-months）。

```feel
duration("P5D")    // duration("P5D")
duration("P32Y")   // duration("P32Y")
```

### `yearsAndMonthsDuration(from, to)`

返回两个日期之间的年月时长。

```feel
yearsAndMonthsDuration(date("2011-12-22"), date("2013-08-24"))   // duration("P1Y8M")
```

### `now()`

返回当前日期时间（含时区）。

```feel
now()   // dateTime("2020-07-31T14:27:30@Europe/Berlin")
```

### `today()`

返回当前日期。

```feel
today()   // date("2020-07-31")
```

### `dayOfWeek(date)`

返回星期几（英文星期名称）。支持 date 与 date-time。

```feel
dayOfWeek(date("2019-09-17"))                  // "Tuesday"
dayOfWeek(dateTime("2019-09-17T12:00:00"))     // "Tuesday"
```

### `dayOfYear(date)`

返回一年中的第几天（格里高利历）。支持 date 与 date-time。

```feel
dayOfYear(date("2019-09-17"))                  // 260
dayOfYear(dateTime("2019-09-17T12:00:00"))     // 260
```

### `weekOfYear(date)`

按 ISO 8601 返回一年中的第几周。支持 date 与 date-time。

```feel
weekOfYear(date("2019-09-17"))                 // 38
weekOfYear(dateTime("2019-09-17T12:00:00"))    // 38
```

### `monthOfYear(date)`

返回月份名称（英文）。支持 date 与 date-time。

```feel
monthOfYear(date("2019-09-17"))                // "September"
monthOfYear(dateTime("2019-09-17T12:00:00"))   // "September"
```

### `lastDayOfMonth(date)` 🧩 Kunpeng Extension `>=8.2`

返回给定日期/日期时间所在月份的最后一天。

```feel
lastDayOfMonth(date("2022-10-01"))                  // date("2022-10-31")
lastDayOfMonth(dateTime("2022-10-16T12:00:00"))     // date("2022-10-31")
```

---

## 五、JSON

### `fromJson(value)` 🧩 Kunpeng Extension `>=8.9`

将 JSON 字符串解析为 FEEL 值；非合法 JSON 返回 `null`。

```feel
fromJson("{\"a\": 1, \"b\": 2}")   // {a: 1, b: 2}
fromJson("true")                   // true
fromJson("\"2023-06-14\"")         // "2023-06-14"
```

### `toJson(value)` 🧩 Kunpeng Extension `>=8.9`

将 FEEL 值序列化为 JSON 字符串；时间相关值会转为 ISO 8601（含时区）。

```feel
toJson({a: 1, b: 2})                          // "{\"a\":1,\"b\":2}"
toJson(true)                                  // "true"
toJson(@"2023-06-14")                         // "\"2023-06-14\""
toJson(@"2025-11-24T10:00:00@Europe/Berlin")  // "\"2025-11-24T10:00:00+01:00[Europe/Berlin]\""
toJson(@"P3Y")                                // "\"P3Y\""
```

---

## 六、List（列表）

### `listContains(list, element)`

判断列表是否包含某元素。

```feel
listContains([1,2,3], 2)   // true
```

### `count(list)`

返回列表元素个数。

```feel
count([1,2,3])   // 3
```

### `min(list)`

返回最小值。可作为列表或元素序列传入（元素需可比较、同类型）。

```feel
min([1,2,3])   // 1
min(1,2,3)     // 1
```

### `max(list)`

返回最大值。可作为列表或元素序列传入。

```feel
max([1,2,3])   // 3
max(1,2,3)     // 3
```

### `sum(list)`

返回数值之和。可作为列表或元素序列传入。

```feel
sum([1,2,3])   // 6
sum(1,2,3)     // 6
```

### `product(list)`

返回数值乘积。可作为列表或元素序列传入。

```feel
product([2, 3, 4])   // 24
product(2, 3, 4)     // 24
```

### `mean(list)`

返回算术平均值。可作为列表或元素序列传入。

```feel
mean([1,2,3])   // 2
mean(1,2,3)     // 2
```

### `median(list)`

返回中位数。可作为列表或元素序列传入。

```feel
median(8, 2, 5, 3, 4)   // 4
median([6, 1, 2, 3])    // 2.5
```

### `stddev(list)`

返回标准差。可作为列表或元素序列传入。

```feel
stddev(2, 4, 7, 5)      // 2.0816659994661326
stddev([2, 4, 7, 5])    // 2.0816659994661326
```

### `mode(list)`

返回众数（列表）。可作为列表或元素序列传入。

```feel
mode(6, 3, 9, 6, 6)         // [6]
mode([6, 1, 9, 6, 1])       // [1, 6]
```

### `sublist(list, start position)`

从 `start position` 起截取子列表。位置从 `1` 起，`-1` 表示末尾。

```feel
sublist([1,2,3], 2)   // [2,3]
```

### `sublist(list, start position, length)`

从 `start position` 起截取指定长度的子列表。

```feel
sublist([1,2,3], 1, 2)   // [1,2]
```

### `append(list, items)`

在列表末尾追加元素（`items` 可为单个或多个元素）。

```feel
append([1], 2, 3)   // [1,2,3]
```

### `concatenate(lists)`

合并多个列表为一个列表。

```feel
concatenate([1,2],[3])    // [1,2,3]
concatenate([1],[2],[3])  // [1,2,3]
```

### `insertBefore(list, position, newItem)`

在 `position` 处插入新元素。位置从 `1` 起，`-1` 表示末尾。

```feel
insertBefore([1,3], 1, 2)   // [2,1,3]
```

### `remove(list, position)`

移除指定位置的元素。位置从 `1` 起，`-1` 表示末尾。

```feel
remove([1,2,3], 2)   // [1,3]
```

### `reverse(list)`

返回反转后的列表。

```feel
reverse([1,2,3])   // [3,2,1]
```

### `indexOf(list, match)`

返回升序排列的匹配位置列表。位置从 `1` 起。

```feel
indexOf([1,2,3,2], 2)   // [2,4]
```

### `union(list)`

合并多个列表并去重。

```feel
union([1,2],[2,3])   // [1,2,3]
```

### `distinctValues(list)`

返回去重后的列表。

```feel
distinctValues([1,2,3,2,1])   // [1,2,3]
```

### `flatten(list)`

将嵌套列表展平为一维列表。

```feel
flatten([[1,2],[[3]], 4])   // [1,2,3,4]
```

### `sort(list, precedes)`

按 `precedes` 比较函数排序。

```feel
sort(list: [3,1,4,5,2], precedes: function(x,y) x < y)   // [1,2,3,4,5]
```

### `duplicateValues(list)` 🧩 Kunpeng Extension `>=8.3`

返回列表中所有重复的值。

```feel
duplicateValues([1,2,3,2,1])   // [1,2]
```

### `isEmpty(list)` 🧩 Kunpeng Extension `>=8.6`

判断列表是否为空。

```feel
isEmpty([])        // true
isEmpty([1,2,3])   // false
```

### `partition(list, size)` 🧩 Kunpeng Extension `>=8.7`

将列表按 `size` 切分为连续子列表（最后一个可能不足）。`size < 0` 返回 `null`。

```feel
partition([1,2,3,4,5], 2)   // [[1,2], [3,4], [5]]
partition([], 2)            // []
partition([1,2], 0)         // null
```

---

## 七、数值与数学（Number / Math）

### `abs(number)`

返回数值的绝对值。

```feel
abs(10)    // 10
abs(-10)   // 10
```

### `abs(n)`

返回时长的绝对值（支持 days-time 与 years-months 时长）。

```feel
abs(duration("-PT5H"))   // duration("PT5H")
abs(duration("PT5H"))    // duration("PT5H")
abs(duration("-P2M"))    // duration("P2M")
```

### `modulo(dividend, divisor)`

返回 dividend 除以 divisor 的余数。

```feel
modulo(12, 5)   // 2
```

### `sqrt(number)`

返回平方根。

```feel
sqrt(16)   // 4
```

### `log(number)`

返回自然对数（以 e 为底）。

```feel
log(10)   // 2.302585092994046
```

### `exp(number)`

返回 e 的指定次幂。

```feel
exp(5)   // 148.4131591025766
```

### `odd(number)`

判断是否为奇数。

```feel
odd(5)   // true
odd(2)   // false
```

### `even(number)`

判断是否为偶数。

```feel
even(5)   // false
even(2)   // true
```

### `randomNumber()` 🧩 Kunpeng Extension `>=8.2`

返回 `[0, 1)` 之间的随机数。

```feel
randomNumber()   // 0.9701618132579795
```

---

## 八、数值舍入（Rounding）

### `decimal(n, scale)`

按 `scale` 位数舍入。

```feel
decimal(1/3, 2)   // .33
decimal(1.5, 0)   // 2
```

### `floor(n)`

向下取整。

```feel
floor(1.5)    // 1
floor(-1.5)   // -2
```

### `floor(n, scale)`

按 `scale` 位数向下舍入。

```feel
floor(-1.56, 1)   // -1.6
```

### `ceiling(n)`

向上取整。

```feel
ceiling(1.5)    // 2
ceiling(-1.5)   // -1
```

### `ceiling(n, scale)`

按 `scale` 位数向上舍入。

```feel
ceiling(-1.56, 1)   // -1.5
```

### `roundUp(n, scale)`

按 `scale` 位数向上舍入（远离零）。

```feel
roundUp(5.5)        // 6
roundUp(-5.5)       // -6
roundUp(1.121, 2)   // 1.13
roundUp(-1.126, 2)  // -1.13
```

### `roundDown(n, scale)`

按 `scale` 位数向下舍入（趋向零）。

```feel
roundDown(5.5, 0)       // 5
roundDown(-5.5, 0)      // -5
roundDown(1.121, 2)     // 1.12
roundDown(-1.126, 2)    // -1.12
```

### `roundHalfUp(n, scale)`

按 `scale` 位数四舍五入（half-up）。

```feel
roundHalfUp(5.5, 0)     // 6
roundHalfUp(-5.5, 0)    // -6
roundHalfUp(1.121, 2)   // 1.12
roundHalfUp(-1.126, 2)  // -1.13
```

### `roundHalfDown(n, scale)`

按 `scale` 位数舍入（half-down）。

```feel
roundHalfDown(5.5, 0)       // 5
roundHalfDown(-5.5, 0)      // -5
roundHalfDown(1.121, 2)     // 1.12
roundHalfDown(-1.126, 2)    // -1.13
```

---

## 九、区间关系（Range / Temporal Comparison）

> 以下函数支持 point 与 range 的多种组合（point/point、range/point、point/range、range/range）。区间语法：
> `[a..b]`（闭区间）、`(a..b]`/`[a..b)`（半开）、`(a..b)`（开区间）。

### `before(...)`

判断前者是否在后者之前。

```feel
before(1, 10)            // true   (point/point)
before([1..5], 10)       // true   (range/point)
before(1, [2..5])        // true   (point/range)
before([1..5], [6..10])  // true   (range/range)
before([1..5), [5..10])  // true
```

### `after(...)`

判断前者是否在后者之后。

```feel
after(10, 1)             // true
after([1..5], 10)        // false
after(12, [2..5])        // true
after([6..10], [1..5])   // true
after([5..10], [1..5))   // true
```

### `meets(range1, range2)`

判断两个区间是否首尾相接（前者的终点 = 后者的起点）。

```feel
meets([1..5], [5..10])   // true
meets([1..3], [4..6])    // false
meets([1..3], [3..5])    // true
meets([1..5], (5..8])    // false
```

### `metBy(range1, range2)`

`meets` 的反向：后者的终点 = 前者的起点。

```feel
metBy([5..10], [1..5])     // true
metBy([3..4], [1..2])      // false
metBy([3..5], [1..3])      // true
metBy((5..8], [1..5))      // false
metBy([5..10], [1..5))     // false
```

### `overlaps(range1, range2)`

判断两区间是否有重叠。

```feel
overlaps([5..10], [1..6])    // true
overlaps((3..7], [1..4])     // true
overlaps([1..3], (3..6])     // false
overlaps((5..8], [1..5))     // false
overlaps([4..10], [1..5))    // true
```

### `overlapsBefore(range1, range2)`

判断是否重叠，且 `range1` 在前（`range1.start < range2.start`）。

```feel
overlapsBefore([1..5], [4..10])    // true
overlapsBefore([3..4], [1..2])     // false
overlapsBefore([1..3], (3..5])     // false
overlapsBefore([1..5), (3..8])     // true
overlapsBefore([1..5), [5..10])    // false
```

### `overlapsAfter(range1, range2)`

判断是否重叠，且 `range1` 在后（`range1.end > range2.end`）。

```feel
overlapsAfter([4..10], [1..5])     // true
overlapsAfter([3..4], [1..2])      // false
overlapsAfter([3..5], [1..3))      // false
overlapsAfter((5..8], [1..5))      // false
overlapsAfter([4..10], [1..5))     // true
```

### `finishes(...)`

判断前者是否以后者的终点结束。

```feel
finishes(5, [1..5])        // true  (point/range)
finishes(10, [1..7])       // false
finishes([3..5], [1..5])   // true  (range/range)
finishes((1..5], [1..5))   // false
finishes([5..10], [1..10)) // false
```

### `finishedBy(...)`

`finishes` 的反向：后者以前者的终点结束。

```feel
finishedBy([5..10], 10)       // true
finishedBy([3..4], 2)         // false
finishedBy([1..5], [3..5])    // true
finishedBy((5..8], [1..5))    // false
finishedBy([5..10], (1..10))  // false
```

### `includes(...)`

判断前者是否包含后者。

```feel
includes([5..10], 6)         // true
includes([3..4], 5)          // false
includes([1..10], [4..6])    // true
includes((5..8], [1..5))     // false
includes([1..10], [1..5))    // true
```

### `during(...)`

`includes` 的反向：判断前者是否被后者包含。

```feel
during(5, [1..10])          // true
during(12, [1..10])         // false
during(1, (1..10])          // false
during([4..6], [1..10))     // true
during((1..5], (1..10])     // true
```

### `starts(...)`

判断前者是否从后者的起点开始。

```feel
starts(1, [1..5])          // true
starts(1, (1..8])          // false
starts((1..5], [1..5])     // false
starts([1..10], [1..5])    // false
starts((1..5), (1..10))    // true
```

### `startedBy(...)`

`starts` 的反向：后者从前者的起点开始。

```feel
startedBy([1..10], 1)         // true
startedBy((1..10], 1)         // false
startedBy([1..10], [1..5])    // true
startedBy((1..10], [1..5))    // false
startedBy([1..10], [1..10))   // true
```

### `coincides(...)`

判断两者是否完全重合。

```feel
coincides(5, 5)              // true
coincides(3, 4)              // false
coincides([1..5], [1..5])    // true
coincides((1..5], [1..5))    // false
coincides([1..5], [2..6])    // false
```

---

## 十、字符串（String）

### `substring(string, start position)`

从 `start position` 起截取子串。位置从 `1` 起，`-1` 表示末尾。

```feel
substring("foobar", 3)    // "obar"
substring("foobar", -2)   // "ar"
```

### `substring(string, start position, length)`

从 `start position` 起截取长度为 `length` 的子串；超出剩余长度时返回到结尾。

```feel
substring("foobar", 3, 3)    // "oba"
substring("foobar", -3, 2)   // "ba"
substring("foobar", 3, 10)   // "obar"
```

### `stringLength(string)`

返回字符数。

```feel
stringLength("foo")   // 3
```

### `upperCase(string)`

转为大写。

```feel
upperCase("aBc4")   // "ABC4"
```

### `lowerCase(string)`

转为小写。

```feel
lowerCase("aBc4")   // "abc4"
```

### `substringBefore(string, match)`

返回 `match` 之前的子串。

```feel
substringBefore("foobar", "bar")   // "foo"
```

### `substringAfter(string, match)`

返回 `match` 之后的子串。

```feel
substringAfter("foobar", "ob")   // "ar"
```

### `contains(string, match)`

判断是否包含子串。

```feel
contains("foobar", "of")   // false
```

### `startsWith(string, match)`

判断是否以 `match` 开头。

```feel
startsWith("foobar", "fo")   // true
```

### `endsWith(string, match)`

判断是否以 `match` 结尾。

```feel
endsWith("foobar", "r")   // true
```

### `matches(input, pattern)`

判断是否匹配正则。

```feel
matches("foobar", "^fo*bar")   // true
```

### `matches(input, pattern, flags)`

带 flags 的正则匹配。`flags` 可包含：`s`(dot-all)、`m`(multi-line)、`i`(忽略大小写)、`x`(注释)。

```feel
matches("FooBar", "foo", "i")   // true
```

### `replace(input, pattern, replacement)`

将所有匹配 `pattern` 的子串替换为 `replacement`。`replacement` 可用 `$1`、`$2` 引用分组。

```feel
replace("abcd", "(ab)|(a)", "[1=$1][2=$2]")        // "[1=ab][2=]cd"
replace("0123456789", "(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3")   // "(012) 345-6789"
```

### `replace(input, pattern, replacement, flags)`

带 flags 的正则替换。

```feel
replace("How do you feel?", "Feel", "FEEL", "i")   // "How do you FEEL?"
```

### `split(string, delimiter)`

按 `delimiter`（正则）切分为子串列表。

```feel
split("John Doe", "\\s")    // ["John", "Doe"]
split("a;b;c;;", ";")       // ["a", "b", "c", "", ""]
```

### `stringJoin(list)`

将字符串列表连接为单个字符串。`null` 元素会被忽略；若元素既非字符串也非 `null`，返回 `null`。

```feel
stringJoin(["a","b","c"])     // "abc"
stringJoin(["a",null,"c"])    // "ac"
stringJoin([])                // ""
```

### `stringJoin(list, delimiter)`

使用分隔符连接。

```feel
stringJoin(["a"], "X")            // "a"
stringJoin(["a","b","c"], ", ")   // "a, b, c"
```

### `stringJoin(list, delimiter, prefix, suffix)` 🧩 Kunpeng Extension

带前缀/后缀的连接。

```feel
stringJoin(["a","b","c"], ", ", "[", "]")   // "[a, b, c]"
```

### `extract(string, pattern)` 🧩 Kunpeng Extension

返回字符串中所有匹配 `pattern`（正则）的子串列表，无匹配返回空列表。

```feel
extract("references are 1234, 1256, 1378", "12[0-9]*")   // ["1234","1256"]
```

### `trim(string)` 🧩 Kunpeng Extension `>=8.6`

去除字符串首尾空格。

```feel
trim("  hello world  ")   // "hello world"
trim("hello   world ")    // "hello   world"
```

### `isBlank(string)` 🧩 Kunpeng Extension `>=8.8`

判断字符串是否为空白（空或仅含空格）。

```feel
isBlank("")              // true
isBlank(" ")             // true
isBlank("hello world")   // false
```

### `toBase64(value)` 🧩 Kunpeng Extension `>=8.6`

将字符串编码为 Base64。

```feel
toBase64("FEEL")   // "RkVFTA=="
```

### `fromBase64(value)` 🧩 Kunpeng Extension

将 Base64 字符串解码为普通字符串。

```feel
fromBase64("RkVFTA==")   // "FEEL"
```

### `uuid()` 🧩 Kunpeng Extension `>=8.6`

返回 36 字符的 UUID。

```feel
uuid()   // "7793aab1-d761-4d38-916b-b7270e309894"
```

---

## 十一、Kunpeng 扩展函数

> 以下为 Kunpeng（Camunda）扩展函数。与上方按类别重复列出的扩展函数（如 `getValue`、`contextPut`、
> `dateTime`、`stringJoin`、`abs` 等），此处仅列出 **仅作为扩展存在**的函数，便于快速检索。

### `isDefined(value)` 🧩 Kunpeng Extension

判断给定值是否已定义（非 `null`）。 **必须传一个参数**。

```feel
isDefined(1)        // true
isDefined(null)     // false
isDefined(x)        // false - 若变量 "x" 不存在
isDefined(x.y)      // false - 若 "x" 不存在或无属性 "y"
isDefined()         // error - 需要一个参数
```

> ⚠️ **Breaking change**：旧版本中当值为 `null` 时返回 `true`，当前版本改为返回 `false`。

### `assert(value, condition)` 🧩 Kunpeng Extension `>=8.3`

校验条件：条件为 `true` 时返回 `value`，否则求值失败并抛错。

```feel
assert(x, x != null)    // "value" - 若 x 为 "value"；error - 若 x 为 null 或不存在
assert(x, x >= 0)       // 4 - 若 x 为 4；error - 若 x < 0
```

### `assert(value, condition, cause)` 🧩 Kunpeng Extension `>=8.3`

带自定义错误消息的 `assert`。

```feel
assert(x, x != null, "'x' should not be null")   // "value" 或 error('x' should not be null)
assert(x, x >= 0, "'x' should be positive")      // 4 或 error('x' should be positive)
```

> 其它扩展函数（`getValue(keys)`、`contextPut(key)`、`contextMerge`、`dateTime(timezone)`、
> `duplicateValues`、 `stringJoin(prefix/suffix)`、`isEmpty`、`partition`、`randomNumber`、`extract`、
> `trim`、`uuid`、`toBase64`、 `fromBase64`、`isBlank`、`lastDayOfMonth`、`fromJson`、`toJson`）请见各自所属类别章节。

---

## 十二、保留关键字函数（Reserved Name）

> 名称中包含保留关键字、需要被注入到 parser context 才能正确解析的函数。

### `getOrElse(value, default)` 🧩 Kunpeng Extension `>=8.3`

若 `value` 非 `null` 则返回 `value`，否则返回 `default`。

```feel
getOrElse("this", "default")    // "this"
getOrElse(null, "default")      // "default"
getOrElse(null, null)           // null
```

---

## 附：使用示例

```js
import {
  kunpengBuiltins, // 全部（标准 + 扩展）
  qlexpressionBuiltins, // 仅标准 FEEL
  kunpengExtensions, // 仅 Kunpeng 扩展
  kunpengReservedNameBuiltins, // 保留关键字函数
} from '@kunpeng/expression-builtins';

// 在 FEEL 编辑器中注入 Camunda 上下文
import ExpressionEditor from '@kunpeng/expression-editor';

const editor = new ExpressionEditor({
  container,
  builtins: kunpengBuiltins,
  parserDialect: 'camunda',
});

// 仅使用标准 FEEL 函数
const standardEditor = new ExpressionEditor({
  container,
  builtins: qlexpressionBuiltins,
});
```

## 维护说明

- 源文件 `src/kunpengBuiltins.js` 由 `npm run update-builtins`（`pull-docs` + `compile-builtins`
  ）自动生成， **请勿手动编辑**。
- 如需新增/修改函数说明，请编辑模板 `tasks/kunpengBuiltins.template.js`（若不存在需先恢复）后重新运行生成任务。
- 本文档与源文件一一对应；若源文件更新，请同步重新生成本文档。
