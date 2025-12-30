# 课程生成与编辑一体化（Asset-first, Traceable, Non-destructive）

## 1. 背景与问题

### 现状
- 现有流程：前端触发后端接口直接生成编辑端素材（image/video/slide_html 等）。
- 编辑端偏向“拼装/调整”，对角色、帧、局部细节控制不足，生成不稳定导致大量返工。

### 核心痛点
- **一致性不可控**：角色、风格、场景在不同镜头漂移，重生成会污染已满意内容。
- **编辑能力不足**：缺少视频剪辑级精修和网页 DOM/CSS 级编辑能力。
- **不可追溯**：缺乏素材来源、参数、改动历史与影响范围的可追踪链路。

---

## 2. 目标与原则

### 产品目标（Must）
- **资产优先（Asset-first）**：先生成并锁定“课程资产包”，后续镜头只引用资产包资源。
- **非破坏式编辑（Non-destructive）**：所有修改产出新版本/派生物，不覆盖原件。
- **全链路可追溯（Traceable & Reproducible）**：完整记录生成输入、模型版本、seed、编辑操作与依赖关系，可复现。

### 设计原则
- **引用而非拷贝**：镜头引用 `asset_id@version`（或 variant），避免分散副本。
- **局部可控**：支持只改某帧/区域/层的再生成与编辑。
- **可比较可回滚**：生成/编辑皆可对比、回滚、分支。
- **灵活可扩展**：覆盖图/视频/3D/音频/HTML 等素材，便于新增模型与编辑能力。

---

## 3. 用户与使用场景

### 用户
- 课程制作人（主用户）：需要快速出课且能精修。
- 教研/审阅：需要可追溯、可验收、可复用资产。

### 典型场景
1. 先选定“角色 + 视觉风格”，生成全课核心资产（角色、背景、图标、音色等）。
2. 组装后发现某帧人物手势不自然 → 仅替换该帧角色层的区域，其他不变。
3. 审阅要求“机器人”换为“老师形象” → 全局替换角色资产，镜头引用自动更新。
4. 需要证明素材来源 → 查看溯源图获取生成参数、编辑历史并可复现。

---

## 4. 核心概念与数据结构

### 4.1 资产包（Asset Pack）
- 定义：课程/章节的可复用素材集合（角色设定、风格设定、背景、道具、图标、BGM、音色、模板等）。
- 原则：镜头必须使用资产包内资源或其派生版本；临时生成需入库标记为“临时资产”。

### 4.2 资产与版本（Asset / Version / Variant）
- **Asset**：稳定 ID，代表概念资源（如机器人角色、森林背景、叶绿体示意图）。
- **Version**：历史版本（v1/v2…），每次编辑/再生成产生新版本。
- **Variant**：同版本下的变体（尺寸/角度/情绪等），遵守同一角色卡/风格指南。

### 4.3 溯源与依赖图（Provenance Graph）
- 来源：generated / uploaded / imported / edited / composed。
- 生成信息：prompt、negative prompt、seed、sampler、model_id、model_version、时间、参数、输入引用（style_guide_id/character_sheet_id）。
- 编辑信息：操作序列（裁剪、调色、关键帧、inpaint mask、文字修改）、操作者、时间、前后版本引用。
- 依赖关系：反向引用哪些镜头、block、render 使用该资产。

---

## 5. 新的端到端流程（Asset-first）
- **Phase A：课程规划（Plan）** → 输出大纲、镜头清单、资产清单。
- **Phase B：资产包生成（Asset Preflight Generation）** → 一次性生成角色卡、风格指南、背景、示意图、音色、模板；提供候选选择与锁定。
- **Phase C：组装（Assemble）** → 根据镜头清单与模板填充时间轴/页面，所有内容引用 `asset_id@version`。
- **Phase D：编辑与修复（Edit & Fix）** → 视频编辑、网页编辑、AI 局部修复，产出新版本入库。
- **Phase E：发布与归档（Publish）** → 渲染交付，资产包可跨课复用。

---

## 6. 编辑能力设计（视频 + 网页）

### 6.1 视频编辑
- 多轨时间轴：Video / Overlay / Text / FX / Audio；剪切、分割、拖拽、对齐、分组、锁轨。
- 转场：淡入淡出、推拉、擦除；速度控制：变速/冻结帧/倒放（可选）。
- 音频：淡入淡出、音量包络、降噪（基础）、BGM ducking（可选）。
- 字幕：自动生成/手动编辑，样式模板、关键字高亮。
- 关键帧与画布：位置/缩放/旋转/透明度关键帧；对象选择、对齐参考线、网格、分布。

### 6.2 网页编辑
- 组件树/DOM 树编辑，属性面板（文本、图片、按钮、交互组件）。
- 样式面板：CSS + 设计 token（color/font/spacing）。
- 布局：Flex/Grid，响应式断点预览。
- 交互：事件（onClick/onAnswer）、状态（正确/错误）、动画（CSS/关键帧）。
- 即时预览与组件级版本控制。

---

## 7. AI 生成与可控再生成

### 7.1 约束
- 角色一致性：引用 character_sheet_id（锁定）。
- 风格一致性：引用 style_guide_id（锁定）。
- 布局约束：可选 layout lock。
- 层级约束：限定修改层（BG/Character/Props/Text）。
- 区域约束：mask inpaint。
- 时间约束：限定帧/片段。

### 7.2 再生成操作（产品化按钮）
- Regenerate This Frame（该帧重生成，保持其他不变）。
- Inpaint This Region（区域重绘）。
- Replace Asset（替换资产：全课/本章/本镜头）。
- Style Match（风格对齐，外部图对齐 style guide）。
- Extend Background（背景扩展用于镜头移动）。

> 每次 AI 操作生成 asset_id@v(n+1) 或新 variant，并写入溯源记录。

---

## 8. 可追溯体系

### 8.1 版本体系
- 资产版本：Asset Version（线性 + 可分支）。
- 工程版本：Project Version（快照）。
- 渲染版本：Render Version（每次导出）。

### 8.2 变更记录（Audit Log）
- who / when / what。
- before_version → after_version。
- impacted_refs（受影响镜头/blocks）。
- diff（参数 diff、文本 diff、CSS diff、时间轴 diff）。

### 8.3 溯源图（Provenance Graph UI）
- 展示来源链路、输入依赖、使用范围。
- 支持版本对比：图像对比、文本 diff、参数 diff。

### 8.4 可复现（Reproducibility）
- 固化 model_id + model_version、prompt_template_id、seed、输入锚点（style guide、character sheet）、生成参数（sampler/steps/cfg 等）。

---

## 9. 系统架构与接口（高层）

### 9.1 核心服务
- Plan Service：大纲/镜头/资产清单生成。
- Asset Service：资产入库、版本、依赖关系、检索。
- Gen Service：AI 生成任务队列（支持约束）。
- Edit Service：编辑操作序列化（非破坏式）。
- Render Service：导出渲染（视频/网页）。
- Provenance Service：溯源图与审计日志。

### 9.2 关键对象
- CourseProject、AssetPack、Asset、AssetVersion/AssetVariant。
- Shot / Block / TimelineEvent。
- EditOperation（可重放）。
- RenderJob / RenderArtifact。

### 9.3 工程清单（Manifest）思路
- 可读 JSON：项目元信息、风格/角色锚点、资产列表与溯源、时间轴引用、编辑序列、渲染记录。

---

## 10. 交互与页面结构改造
- 生成界面新增“资产包阶段”：规划 → 资产包生成（候选/选择/锁定）→ 组装进入编辑。
- 编辑界面新增面板：Asset Browser（按类型/章节/锁定状态）、Inspector（对象层级/引用/版本/锁定/编辑入口）、History/Provenance（版本树/对比/回滚/影响范围）。
- 在对象就地提供替换/重生成操作，无需跳转生成流程。

---

## 11. 验收标准（DoD）
- 一致性：角色/风格全课一致；角色替换可一键全局生效；外来图一键风格对齐入库。
- 编辑：可选中任意帧/层做位置、缩放、样式、关键帧编辑；可局部重绘或帧级重生成且不影响其他镜头。
- 追溯：任意素材可查看来源、prompt、seed、模型版本、编辑历史、依赖镜头、渲染版本；任意版本可对比、回滚、复现生成。

---

## 12. 指标与效果评估
- 一致性返工率：角色漂移导致返工次数/课。
- 局部修复占比：局部编辑 vs 全课重生成（越高越好）。
- 产出效率：从生成到可发布的平均耗时。
- 版本可用性：回滚成功率、对比使用率。
- 资产复用率：同系列课程复用 Asset Pack 的比例。

---

## 13. 迭代路线（建议）
- **P0（最小闭环）**：资产包生成（候选选择+锁定）；资产引用机制；基础视频编辑；溯源最小集（prompt/seed/model/version/引用关系）。
- **P1（强编辑与稳定生产）**：局部重绘/帧级重生成/替换资产；网页编辑；版本对比与回滚（资产版本树+工程快照）。
- **P2（生产级）**：批量风格对齐与替换、自动一致性检测；协作审阅（批注/任务/审批）；资产包跨课程复用与市场化。

---

## 14. 关键立即改动（三点）
1. 将生成拆分为“资产包生成 + 组装引用”，先锁定角色/背景/示意图等核心资产。
2. 镜头只存引用 `asset_id@version`，编辑产出新版本而非覆盖。
3. 溯源与版本从第一天就要记录，避免规模化后不可控。
