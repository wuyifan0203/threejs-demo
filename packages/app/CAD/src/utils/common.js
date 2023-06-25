function isSameValue(v1,v2) {
    return stringify(v1) === stringify(v2)
}

function parse(v) {
    return JSON.parse(v)
}

function stringify(v) {
    return JSON.stringify(v)
}

export {
    isSameValue,
    parse,
    stringify
}