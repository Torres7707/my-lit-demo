import { LitElement, PropertyValues } from "lit";
export declare class MyLitDemo extends LitElement {
    container: HTMLDivElement;
    private graph?;
    private layoutDir;
    static styles: import("lit").CSSResult;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    private initGraph;
    private runLayout;
    private updateEdgeVertices;
    private createNewNode;
    private createNewEdge;
    private loadInitialData;
    render(): import("lit-html").TemplateResult<1>;
}
