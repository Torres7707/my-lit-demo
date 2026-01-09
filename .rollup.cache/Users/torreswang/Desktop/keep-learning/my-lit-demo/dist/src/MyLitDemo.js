import { __decorate, __metadata } from "tslib";
import { LitElement, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
import { Graph, Dom } from "@antv/x6";
import { DagreLayout } from "@antv/layout";
const MALE = "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*kUy8SrEDp6YAAAAAAAAAAAAAARQnAQ";
const FEMALE = "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*f6hhT75YjkIAAAAAAAAAAAAAARQnAQ";
let MyLitDemo = class MyLitDemo extends LitElement {
    constructor() {
        super(...arguments);
        this.layoutDir = "LR";
    }
    firstUpdated(_changedProperties) {
        this.initGraph();
        this.loadInitialData();
    }
    initGraph() {
        try {
            Graph.registerNode("org-node", {
                width: 260,
                height: 88,
                markup: [
                    { tagName: "rect", attrs: { class: "card" } },
                    { tagName: "image", attrs: { class: "image" } },
                    { tagName: "text", attrs: { class: "rank" } },
                    { tagName: "text", attrs: { class: "name" } },
                    {
                        tagName: "g",
                        attrs: { class: "btn add" },
                        children: [
                            { tagName: "circle", attrs: { class: "add-circle" } },
                            { tagName: "text", attrs: { class: "add-icon" } },
                        ],
                    },
                    {
                        tagName: "g",
                        attrs: { class: "btn del" },
                        children: [
                            { tagName: "circle", attrs: { class: "del-circle" } },
                            { tagName: "text", attrs: { class: "del-icon" } },
                        ],
                    },
                ],
                attrs: {
                    ".card": {
                        rx: 10,
                        ry: 10,
                        refWidth: "100%",
                        refHeight: "100%",
                        fill: "#5F95FF",
                        stroke: "#5F95FF",
                    },
                    ".image": { x: 16, y: 16, width: 56, height: 56 },
                    ".rank": {
                        refX: 0.95,
                        refY: 0.35,
                        fill: "#fff",
                        fontSize: 12,
                        textAnchor: "end",
                    },
                    ".name": {
                        refX: 0.95,
                        refY: 0.7,
                        fill: "#fff",
                        fontSize: 14,
                        fontWeight: "600",
                        textAnchor: "end",
                    },
                    ".btn.add": { refDx: -16, refY: 16, event: "node:add" },
                    ".btn.del": { refDx: -44, refY: 16, event: "node:delete" },
                    ".add-icon": { fontSize: 18, fill: "#fff", x: -4.5, y: 6, text: "+" },
                    ".del-icon": { fontSize: 22, fill: "#fff", x: -4, y: 5, text: "-" },
                },
            });
            Graph.registerEdge("org-edge", {
                zIndex: -1,
                attrs: {
                    line: { strokeWidth: 2, stroke: "#A2B1C3", targetMarker: null },
                },
            });
        }
        catch (e) {
            /* 忽略重复注册 */
        }
        this.graph = new Graph({
            container: this.container,
            autoResize: true,
            background: { color: "#f5f7fa" },
            interacting: false,
            // scroller: { enabled: true, pannable: true }
        });
        this.graph.on("node:add", ({ node }) => {
            var _a;
            const newNode = this.createNewNode("New Hire", "New Employee", Math.random() > 0.5 ? MALE : FEMALE);
            const newEdge = this.createNewEdge(node.id, newNode.id);
            (_a = this.graph) === null || _a === void 0 ? void 0 : _a.addCell([newNode, newEdge]);
            this.runLayout();
        });
        this.graph.on("node:delete", ({ node }) => {
            var _a;
            (_a = this.graph) === null || _a === void 0 ? void 0 : _a.removeCell(node);
            this.runLayout();
        });
    }
    async runLayout() {
        if (!this.graph)
            return;
        // 1. 准备原始数据对象
        // 布局引擎会直接在这个 data 对象上进行“原地修改”
        const data = {
            nodes: this.graph.getNodes().map((node) => ({
                id: node.id,
                width: node.size().width,
                height: node.size().height,
                // 这里初始没有 x, y
            })),
            edges: this.graph.getEdges().map((edge) => ({
                id: edge.id,
                source: edge.getSourceCellId(),
                target: edge.getTargetCellId(),
            })),
        };
        // 2. 实例化布局
        const dagreLayout = new DagreLayout({
            rankdir: this.layoutDir,
            nodesep: 40,
            ranksep: 60,
            nodeSize: (node) => [node.width, node.height],
        });
        // 3. 执行布局（注意：不要接收返回值）
        // 执行完毕后，data.nodes 里的每个元素都会多出 x 和 y 属性
        await dagreLayout.execute(data);
        // 4. 将修改后的 data 应用回 X6
        this.graph.batchUpdate(() => {
            var _a;
            data.nodes.forEach((n) => {
                var _a;
                const cell = (_a = this.graph) === null || _a === void 0 ? void 0 : _a.getCellById(n.id);
                if (cell && n.x !== undefined && n.y !== undefined) {
                    // 源码证明：n.x 和 n.y 是计算后的中心点
                    // 转换为 X6 所需的左上角坐标
                    cell.position(n.x - n.width / 2, n.y - n.height / 2);
                }
            });
            (_a = this.graph) === null || _a === void 0 ? void 0 : _a.getEdges().forEach((edge) => {
                this.updateEdgeVertices(edge);
            });
        });
        this.graph.zoomToFit({ padding: 40 });
        this.graph.centerContent();
    }
    updateEdgeVertices(edge) {
        const source = edge.getSourceNode();
        const target = edge.getTargetNode();
        if (!source || !target)
            return;
        const sBBox = source.getBBox();
        const tBBox = target.getBBox();
        if (this.layoutDir === "LR") {
            if (Math.abs(sBBox.y - tBBox.y) > 1) {
                const gap = tBBox.x - (sBBox.x + sBBox.width);
                const x = sBBox.x + sBBox.width + gap / 2;
                edge.setVertices([
                    { x, y: sBBox.center.y },
                    { x, y: tBBox.center.y },
                ]);
            }
            else {
                edge.setVertices([]);
            }
        }
        else {
            if (Math.abs(sBBox.x - tBBox.x) > 1) {
                const gap = tBBox.y - (sBBox.y + sBBox.height);
                const y = sBBox.y + sBBox.height + gap / 2;
                edge.setVertices([
                    { x: sBBox.center.x, y },
                    { x: tBBox.center.x, y },
                ]);
            }
            else {
                edge.setVertices([]);
            }
        }
    }
    createNewNode(rank, name, image) {
        return this.graph.createNode({
            shape: "org-node",
            attrs: {
                ".image": { xlinkHref: image },
                ".rank": { text: Dom.breakText(rank, { width: 160, height: 45 }) },
                ".name": { text: Dom.breakText(name, { width: 160, height: 45 }) },
            },
        });
    }
    createNewEdge(sourceId, targetId) {
        return this.graph.createEdge({
            shape: "org-edge",
            source: { cell: sourceId },
            target: { cell: targetId },
        });
    }
    async loadInitialData() {
        var _a;
        const nodes = [
            this.createNewNode("Founder & Chairman", "Pierre Omidyar", MALE),
            this.createNewNode("President & CEO", "Margaret C. Whitman", FEMALE),
            this.createNewNode("President, PayPal", "Scott Thompson", MALE),
        ];
        const edges = [
            this.createNewEdge(nodes[0].id, nodes[1].id),
            this.createNewEdge(nodes[1].id, nodes[2].id),
        ];
        (_a = this.graph) === null || _a === void 0 ? void 0 : _a.resetCells([...nodes, ...edges]);
        await this.runLayout();
    }
    render() {
        return html `<div id="container"></div>`;
    }
};
MyLitDemo.styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    #container {
      width: 100%;
      height: 100%;
      background-color: #f5f7fa;
    }
    .x6-node .btn {
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .x6-node .btn:hover {
      opacity: 0.8;
    }
  `;
__decorate([
    query("#container"),
    __metadata("design:type", HTMLDivElement)
], MyLitDemo.prototype, "container", void 0);
MyLitDemo = __decorate([
    customElement("my-lit-demo")
], MyLitDemo);
export { MyLitDemo };
//# sourceMappingURL=MyLitDemo.js.map