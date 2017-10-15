export default   {
    log: function (data) {
        if (DEV_SPACE == NODE_ENV) {
            console.log("test " + DEV_SPACE);
        } else {
            console.clear();
        }
    },
    error: function (data) {
        if (DEV_SPACE == NODE_ENV) {
            console.error("error  " + DEV_SPACE);
        } else {
            console.clear();
        }
    },
    warn: function (data) {
        if (DEV_SPACE == NODE_ENV) {
            console.warn("warn   " + DEV_SPACE);
        } else {
            console.clear();
        }
    }
}