// ==UserScript==
// @name         emex_article_get
// @version      1.05
// @description  Collect replacements on Exist.ru!
// @author       Anton
// @namespace    https://github.com/anton2424/novo/raw/master/tampermonkey/
// @updateURL    https://github.com/anton2424/novo/raw/master/tampermonkey/emex_article_get.js
// @downloadURL  https://github.com/anton2424/novo/raw/master/tampermonkey/emex_article_get.js
// @match        https://www.emex.ru/f?detailNum=*
// @match        https://emex.ru/f?detailNum=*
// @include      https://www.emex.ru/f?detailNum=*
// @include      https://emex.ru/f?detailNum=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var divTextArea153 = document.createElement('div');
    document.body.insertBefore(divTextArea153, document.body.children[3]);
    divTextArea153.id = "textarea153";
    divTextArea153.style = "position: absolute; top: 6px; left: 5px; z-index:1";
    divTextArea153.innerHTML = "<div style='margin-bottom: 6px;position:fixed'><button id='btn153'>Артикулы!</button></div><div><textarea style='height:150px; width:50%;'></textarea></div>";

    document.getElementById('btn153').onclick = function(){
        document.getElementById('textarea153').children[1].children[0].value = "";
        var arr_number = [];
        for(var i=0; i < document.getElementsByClassName('detail-numbers').length; i++){
            arr_number.push(document.getElementsByClassName('detail-numbers')[i].innerText.replace(/[-().^+\/\\ ]+/g, "").replace("\n", ","));
        }
        document.getElementById('textarea153').children[1].children[0].value = arr_number;
        document.getElementById('textarea153').children[1].children[0].value = document.getElementById('textarea153').children[1].children[0].value.replace(/,/g, ", ");
    };
})();