/**
 * Generates a CustomEvent with additional type-checks so name & payload are properly correlated,
 * based on HTMLElementEventMap extra registered event mappings
 */
export const strictCustomEvent = <
    T extends keyof Omit<HTMLElementEventMap, defaultHTMLElementEventNames>,
    D extends UnpackCustomEventPayload<HTMLElementEventMap[T]>
>(
    name: T,
    payload: Omit<CustomEventInit<D>, 'detail'> & {
        detail: D
    } /* we know better than the generic CustomEventInit since detail must match the shape of the matching event */
): CustomEvent<D> => new CustomEvent(name, payload)

/**
 * Extracts the detail type from a custom event type
 */
type UnpackCustomEventPayload<T> = T extends CustomEvent<infer U> ? U : never

type Omit<T, K> = Pick<T, Exclude<keyof T, K>> // A more strict type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> breaks TypeScript 2.9, works in 3.0

/**
 * List of all standard dom events, extracted from TypeScript lib.dom.d.ts.
 * In a clean environment, these would just be `keyof HTMLElementEventMap`
 * We copy them here explicitly because we want to be able to pick up extra custom fields added to the HTMLElementEventMap
 */
type defaultHTMLElementEventNames =
    | 'animationcancel'
    | 'animationend'
    | 'animationiteration'
    | 'animationstart'
    | 'gotpointercapture'
    | 'lostpointercapture'
    | 'pointercancel'
    | 'pointerdown'
    | 'pointerenter'
    | 'pointerleave'
    | 'pointermove'
    | 'pointerout'
    | 'pointerover'
    | 'pointerup'
    | 'touchcancel'
    | 'touchend'
    | 'touchmove'
    | 'touchstart'
    | 'transitioncancel'
    | 'transitionend'
    | 'transitionrun'
    | 'transitionstart'
    | 'wheel'
    | 'abort'
    | 'activate'
    | 'beforeactivate'
    | 'beforedeactivate'
    | 'blur'
    | 'canplay'
    | 'canplaythrough'
    | 'change'
    | 'click'
    | 'contextmenu'
    | 'dblclick'
    | 'deactivate'
    | 'drag'
    | 'dragend'
    | 'dragenter'
    | 'dragleave'
    | 'dragover'
    | 'dragstart'
    | 'drop'
    | 'durationchange'
    | 'emptied'
    | 'ended'
    | 'error'
    | 'focus'
    | 'fullscreenchange'
    | 'fullscreenerror'
    | 'input'
    | 'invalid'
    | 'keydown'
    | 'keypress'
    | 'keyup'
    | 'load'
    | 'loadeddata'
    | 'loadedmetadata'
    | 'loadstart'
    | 'mousedown'
    | 'mousemove'
    | 'mouseout'
    | 'mouseover'
    | 'mouseup'
    | 'mousewheel'
    | 'MSContentZoom'
    | 'MSGestureChange'
    | 'MSGestureDoubleTap'
    | 'MSGestureEnd'
    | 'MSGestureHold'
    | 'MSGestureStart'
    | 'MSGestureTap'
    | 'MSInertiaStart'
    | 'MSManipulationStateChanged'
    | 'MSPointerCancel'
    | 'MSPointerDown'
    | 'MSPointerEnter'
    | 'MSPointerLeave'
    | 'MSPointerMove'
    | 'MSPointerOut'
    | 'MSPointerOver'
    | 'MSPointerUp'
    | 'mssitemodejumplistitemremoved'
    | 'msthumbnailclick'
    | 'pause'
    | 'play'
    | 'playing'
    | 'pointerlockchange'
    | 'pointerlockerror'
    | 'progress'
    | 'ratechange'
    | 'readystatechange'
    | 'reset'
    | 'scroll'
    | 'seeked'
    | 'seeking'
    | 'select'
    | 'selectionchange'
    | 'selectstart'
    | 'stalled'
    | 'stop'
    | 'submit'
    | 'suspend'
    | 'timeupdate'
    | 'volumechange'
    | 'waiting'
    | 'webkitfullscreenchange'
    | 'webkitfullscreenerror'

export default strictCustomEvent