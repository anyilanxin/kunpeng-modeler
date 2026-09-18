# 第 13 章 分类与分组（Category / CategoryValue）

> 对应原规范：Ch 8.4.1 Artifacts → Category / Group（p.94-101）+ Ch 8.4.7 FlowElement.categoryValueRef（p.115）

## 13.1 定位与作用

`Category` 和 `CategoryValue` 属于 BPMN 元模型中的 **Artifact（工件）** 家族，归类在 §8.4 Common Elements 下。

✅ **核心定位**（原书 p.98 原文）：

> "Categories, which have user-defined semantics, can be used for documentation or analysis purposes."

**主要用途**：

- 给 FlowElement 打**业务分类标签**（用户自定义语义）
- 文档 / 分析用途：例如按"客户导向 vs 支持导向"分类 Activity，计算每类的成本和时间
- **不影响流程执行**，是纯元数据

## 13.2 元素关系图

```
RootElement (abstract)
    └── Category                       ← 顶级元素，在 Definitions 下定义
            │ name: string
            │
            └── categoryValue [0..*]
                    │
                    ↓
                CategoryValue           ← 具体的分类值
                    │ value: string
                    │ category: Category [0..1]              (反向引用)
                    │ categorizedFlowElements [0..*]         (派生：被哪些元素引用)
                    ↑
                    │ categoryValueRef [0..*]
                    │
        ┌───────────┴───────────────┐
        │                           │
   FlowElement                  Group (Artifact)
   (节点 + 连线)                 (视觉分组框)
```

## 13.3 Category 元素

### 13.3.1 定义

✅ **继承**：`RootElement`（顶级元素，独立生命周期，可被多个元素引用复用）

✅ **containment**：必须在 `<definitions>` 根下定义，是**全局可复用**的资源

### 13.3.2 属性（Table 8.22）

| 属性 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| **name** | string | 否 | 类别的**语义名称**，如 "Region"、"客户类型"、"成本中心" |
| **categoryValue** | CategoryValue [0..*] | 否 | 此 Category 下的**多个具体值** |

### 13.3.3 典型例子

```
Category(name="Region")
├── CategoryValue(value="North")
├── CategoryValue(value="South")
├── CategoryValue(value="West")
└── CategoryValue(value="East")

Category(name="客户类型")
├── CategoryValue(value="VIP")
├── CategoryValue(value="普通")
└── CategoryValue(value="试用")
```

### 13.3.4 XML Schema（Table 8.27）

```xml
<xsd:element name="category" type="tCategory" substitutionGroup="rootElement"/>
<xsd:complexType name="tCategory">
  <xsd:complexContent>
    <xsd:extension base="tRootElement">
      <xsd:sequence>
        <xsd:element ref="categoryValue" minOccurs="0" maxOccurs="unbounded"/>
      </xsd:sequence>
      <xsd:attribute name="name" type="xsd:string"/>
    </xsd:extension>
  </xsd:complexContent>
</xsd:complexType>
```

⚠️ **关键点**：`substitutionGroup="rootElement"` 表示 Category 是**顶级元素**，必须挂在 `<definitions>` 下。

## 13.4 CategoryValue 元素

### 13.4.1 定义

`CategoryValue` 是 Category 下的**具体值**，是被 FlowElement 实际引用的对象。

✅ **继承**：`BaseElement`（注意：**不是** RootElement，是 Category 的内嵌元素）

### 13.4.2 属性（Table 8.23）

| 属性 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| **value** | string | 否 | 具体值，如 "North"、"VIP" |
| category | Category [0..1] | — | 反向引用所属的 Category（自动派生） |
| **categorizedFlowElements** | FlowElement [0..*] | — | 引用此 CategoryValue 的所有 FlowElement（**派生属性**，自动维护） |

### 13.4.3 XML Schema（Table 8.28）

```xml
<xsd:element name="categoryValue" type="tCategoryValue"/>
<xsd:complexType name="tCategoryValue">
  <xsd:complexContent>
    <xsd:extension base="tBaseElement">
      <xsd:attribute name="value" type="xsd:string" use="optional"/>
    </xsd:extension>
  </xsd:complexContent>
</xsd:complexType>
```

## 13.5 引用 CategoryValue 的两种机制 ⭐

### 13.5.1 机制 1：FlowElement 直接引用（语义层）

> 对应原书 Table 8.44（p.115）

**每个 FlowElement 都有 categoryValueRef 属性**：

| 属性                 | 类型                 | 说明                   |
| -------------------- | -------------------- | ---------------------- |
| **categoryValueRef** | CategoryValue [0..*] | 引用的 Category Values |

**适用范围**：所有 FlowElement 子类 —— Events、Activities、Gateways、SequenceFlow、DataObject、DataAssociation 等。

**XML 写法**：

```xml
<userTask id="task1" name="处理订单">
  <categoryValueRef>cv_vip</categoryValueRef>
  <categoryValueRef>cv_north</categoryValueRef>
</userTask>
```

✅ **特点**：

- 一个元素可以**同时打多个 CategoryValue 标签**（多维度分类）
- 是**纯语义**的，不依赖图形布局
- **引擎可读**，可以做查询 / 统计 / 过滤

### 13.5.2 机制 2：Group 视觉包含（图形层）

> 对应原书 §8.4.1 Group（p.96-98）

`Group` 是 Artifact 的一种，画在流程图上是一个**虚线圆角矩形框**。**画在 Group 框内的 FlowElement 自动获得该 Group 的 CategoryValue**。

| Group 属性           | 类型                 | 说明                          |
| -------------------- | -------------------- | ----------------------------- |
| **categoryValueRef** | CategoryValue [0..1] | 此 Group 代表的 CategoryValue |

**规则**（原书 p.98）：

> "The graphical elements within the Group will be assigned the CategoryValue of the Group."

**特点**：

- 是**视觉层面**的分组，相当于在图上"画个圈"
- 可以**跨越 Pool 边界**（Artifact 不受 Pool 约束）
- Group 的 label 显示格式：`<Category.name>:<CategoryValue.value>` 或仅 `<CategoryValue.value>`
- **不影响流程执行**

### 13.5.3 两种机制对比

| 维度 | FlowElement.categoryValueRef | Group（视觉包含） |
| --- | --- | --- |
| 语义层 vs 图形层 | **语义层**（元数据） | **图形层**（视觉框） |
| 可见性 | XML 里，图中不一定可见 | 流程图中可见（虚线框） |
| 跨 Pool | ✅ 支持 | ✅ 支持 |
| 多标签 | ✅ 多个 categoryValueRef | ❌ 一个 Group 一个 CategoryValue |
| 引擎可查询 | ✅ | ⚠️ 通过 categorizedFlowElements 派生 |
| 影响执行 | ❌ | ❌ |

## 13.6 完整 XML 示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             targetNamespace="http://example.com/order">

  <!-- ============ 1. 定义 Categories（顶级元素） ============ -->
  <category id="cat_region" name="Region">
    <categoryValue id="cv_north" value="North"/>
    <categoryValue id="cv_south" value="South"/>
  </category>

  <category id="cat_customer" name="Customer Type">
    <categoryValue id="cv_vip" value="VIP"/>
    <categoryValue id="cv_normal" value="Normal"/>
  </category>

  <category id="cat_business" name="Business Domain">
    <categoryValue id="cv_finance" value="Finance"/>
    <categoryValue id="cv_logistics" value="Logistics"/>
  </category>

  <!-- ============ 2. 流程定义 ============ -->
  <process id="orderProcess" name="订单处理">

    <!-- 机制 1：FlowElement 直接引用 CategoryValue -->
    <userTask id="task_approve" name="审批订单">
      <categoryValueRef>cv_vip</categoryValueRef>
      <categoryValueRef>cv_finance</categoryValueRef>
    </userTask>

    <serviceTask id="task_ship" name="发货">
      <categoryValueRef>cv_logistics</categoryValueRef>
    </serviceTask>

    <!-- 机制 2：通过 Group 视觉分组 -->
    <group id="grp_north_region" categoryValueRef="cv_north"/>

    <sequenceFlow sourceRef="task_approve" targetRef="task_ship"/>
  </process>
</definitions>
```

## 13.7 引擎实现要点

### 13.7.1 解析与存储

```java
interface Category extends RootElement {
    String getName();
    List<CategoryValue> getCategoryValues();
}

interface CategoryValue extends BaseElement {
    String getValue();
    Category getCategory();
    List<FlowElement> getCategorizedFlowElements();  // 派生
}

interface FlowElement extends BaseElement {
    String getName();
    List<CategoryValue> getCategoryValueRef();  // 直接引用
}
```

### 13.7.2 索引建议

引擎持久化层应建立**反向索引**，便于按分类查询：

```
category_value_index:
  cv_vip -> [task_approve, task_refund, ...]
  cv_finance -> [task_approve, task_pay, ...]
```

支持查询：

- "查所有 VIP 相关的活动" → 用 cv_vip 反查
- "统计 Finance 域的 Activity 总执行时间" → 用 cv_finance 反查后聚合

### 13.7.3 与 kunpeng 项目现状

参考代码（`CategoryValue.java:25` 已存在）：

- `Category` 继承 `BaseElement`，在 bpmn-model 中已建模
- `Group` 通过 `categoryValueRef` 关联
- `FlowElement` 已支持 `categoryValueRef`（位于 FlowElementImpl）
- kunpeng 引擎可以直接复用这套模型，**无需扩展**

## 13.8 关键约束与陷阱

✅ **规范性约束**（散落在原规范各处）：

1. **Category 必须在 Definitions 下**：不能内嵌在 Process 里
2. **CategoryValue 必须内嵌在 Category 里**：不能独立定义
3. **Group 不能连接 SequenceFlow 或 MessageFlow**：Artifact 的通用约束
4. **categoryValueRef 是 QName 引用**：必须指向已定义的 CategoryValue
5. **Group 跨 Pool 是允许的**：Artifact 不受 Pool / Lane 约束
6. **CategoryValue.value 可选**：可以只有 id 没有值（很少这么用）

⚠️ **常见陷阱**：

- 把 Category 当成流程变量用 → 它**不参与执行**，只是元数据
- 期望 Group 像子流程一样有执行语义 → 不会，纯视觉
- 不维护 categorizedFlowElements 反向索引 → 查询性能差

## 13.9 与其他"分组"机制对比

| 机制                   | 是否可执行  | 跨 Pool | 多维度 | 用途            |
| ---------------------- | ----------- | ------- | ------ | --------------- |
| **Sub-Process**        | ✅ 影响     | ❌      | ❌     | 执行作用域      |
| **Lane**               | ⚠️ 资源分配 | ❌      | ❌     | 角色分工        |
| **Group + Category**   | ❌ 纯元数据 | ✅      | ✅     | 业务分类标注    |
| **Pool / Participant** | ✅ 协作边界 | —       | ❌     | 组织 / 系统边界 |
| **Conversation**       | ⚠️ 消息分组 | ✅      | ✅     | 消息流分组      |

## 13.10 业务场景示例

### 13.10.1 场景 1：多维度业务标签

电商流程的 Activity 需要按"业务域"+"客户等级"双维度分类：

```xml
<category id="cat_domain" name="Business Domain">
  <categoryValue id="cv_order" value="订单"/>
  <categoryValue id="cv_payment" value="支付"/>
  <categoryValue id="cv_logistics" value="物流"/>
</category>

<category id="cat_customer_level" name="Customer Level">
  <categoryValue id="cv_vip" value="VIP"/>
  <categoryValue id="cv_normal" value="Normal"/>
</category>

<process id="shoppingFlow">
  <userTask id="approveOrder" name="审批订单">
    <categoryValueRef>cv_order</categoryValueRef>
    <categoryValueRef>cv_vip</categoryValueRef>
  </userTask>
</process>
```

✅ 一个 Activity 同时是"订单"域和"VIP"等级。

### 13.10.2 场景 2：跨 Pool 业务分组

多方协作流程中，把分散在不同 Pool 的相关 Activity 归到一个 Group：

```
┌───────────── Buyer Pool ─────────────┐  ┌──── Seller Pool ────┐
│                                      │  │                     │
│   Place Order ──── (Group: Trade)    │  │  (Group: Trade)     │
│                                      │  │     ─── Receive Order│
│                                      │  │                     │
└──────────────────────────────────────┘  └─────────────────────┘
```

Group "Trade" 横跨两个 Pool，所有框内的 Activity 自动获得 cv_trade 标签。

### 13.10.3 场景 3：报表与分析维度

按 Category 做成本 / 时间统计：

```sql
-- 统计每个 Business Domain 的总耗时
SELECT c.name AS domain, SUM(a.duration)
FROM activity_instance a
JOIN flow_element fe ON a.element_id = fe.id
JOIN flow_element_category fec ON fe.id = fec.flow_element_id
JOIN category_value cv ON fec.category_value_id = cv.id
JOIN category c ON cv.category_id = c.id
WHERE c.name = 'Business Domain'
GROUP BY c.name;
```

## 13.11 总结

- **Category** 是 BPMN 提供的**正式元数据分类机制**，不是引擎执行概念
- **两种引用方式**：FlowElement 直接引用（语义）+ Group 视觉包含（图形）
- **典型应用**：业务域分类、客户类型标记、区域划分、报表维度
- **引擎应支持**：解析 + 反向索引 + 按 Category 查询
- **kunpeng 已有元模型**（`Category`、`CategoryValue`、`FlowElement.categoryValueRef`、`Group.categoryValueRef`），可直接复用
