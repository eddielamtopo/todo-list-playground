/**
 * CustomEvent Constructor IE polyfill
 * Mixture of https://github.com/tuxsudo/polyfill-custom-event/blob/master/index.js & https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'function') {
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined }
        var evt = document.createEvent('CustomEvent')
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
        return evt
    }

    CustomEvent.prototype = window.Event.prototype

    window.CustomEvent = CustomEvent
}

export default null