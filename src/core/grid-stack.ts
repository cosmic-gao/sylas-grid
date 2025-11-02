import {
    type DDElementHost,
    type GridStackWidget,
    type GridHTMLElement,
    type GridItemHTMLElement,
    type GridStackOptions,
    type GridStackDroppedHandler,
    type GridStackEventHandler,
    type GridStackNodesHandler,
    type GridStackElementHandler,
    GridStack as GridStackNative
} from 'gridstack';

export interface GridStackEventEmitt {
    dropped: GridStackDroppedHandler;
    enable: GridStackEventHandler;
    disable: GridStackEventHandler;
    change: GridStackNodesHandler;
    added: GridStackNodesHandler;
    removed: GridStackNodesHandler;
    resizecontent: GridStackNodesHandler;
    resizestart: GridStackElementHandler;
    resize: GridStackElementHandler;
    resizestop: GridStackElementHandler;
    dragstart: GridStackElementHandler;
    drag: GridStackElementHandler;
    dragstop: GridStackElementHandler;
};

export interface GridStack extends GridStackNative {
    _gsEventHandler: Partial<{
        [K in keyof GridStackEventEmitt]: GridStackEventEmitt[K];
    }>;
    _removeDD(el: DDElementHost): GridStack;
    _triggerChangeEvent(): GridStack;
    _triggerRemoveEvent(): GridStack;
    _readAttr(el: HTMLElement, clearDefaultAttr?: boolean): GridStackWidget;
    _leave(el: GridItemHTMLElement, helper?: GridItemHTMLElement): void;
    _updateContainerHeight(): GridStack;
}

export class GridStack extends GridStackNative {
    public constructor(el: GridHTMLElement, opts: GridStackOptions = {}) {
        super(el, opts);
    }
}