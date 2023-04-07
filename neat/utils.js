function getMaxValue(a, b, c) {
    return Math.max(a, b, c);
}

// Function to normalize a value to a range between 0 and 1 using p5.js map
function normalizeValue(value, min, max) {
    return map(value, min, max, 0, 1);
}

function maximum(a, b){
    if(parseFloat(a)>parseFloat(b)) return a;
    return b
}