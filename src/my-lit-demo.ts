import { MyLitDemo } from './MyLitDemo.js';

if (!window.customElements.get('my-lit-demo')) {
    window.customElements.define('my-lit-demo', MyLitDemo);
}
