
function jumpTo(url, params) {
        document.cookie = params;
        $(location).attr('href', url);
}

function getDataByCoockie(pname) {
        var obj = JSON.parse(document.cookie);
        return obj[pname];
}