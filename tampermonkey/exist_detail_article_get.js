// ==UserScript==
// @name         exist_detail_article_get
// @version      1.28
// @description  Collect replacements on Exist.ru!
// @author       Anton
// @namespace    https://github.com/anton2424/novo/raw/master/tampermonkey/
// @updateURL    https://github.com/anton2424/novo/raw/master/tampermonkey/exist_detail_article_get.js
// @downloadURL  https://github.com/anton2424/novo/raw/master/tampermonkey/exist_detail_article_get.js
// @match        https://www.exist.ru/Price/?pcode=*
// @match        https://exist.ru/Price/?pcode=*
// @match        https://www.exist.ru/Price/?pid=*
// @match        https://exist.ru/Price/?pid=*
// @include      https://www.exist.ru/Price/?pcode=*
// @include      https://exist.ru/Price/?pcode=*
// @include      https://www.exist.ru/Price/?pid=*
// @include      https://exist.ru/Price/?pid=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // DivWrapper
    console.dir("i update 4");
    let divWrapper = document.createElement('div');
    divWrapper.id = "ats-wrapper__article";
    divWrapper.style.position="absolute";
    divWrapper.style.top = "6px";
    divWrapper.style.left = "5px";
    divWrapper.style.zIndex = "100";
    divWrapper.style.display="flex";
    divWrapper.style.flexDirection="column";
    divWrapper.style.flexWrap="wrap";

    // Button
    let buttonGetArticle = document.createElement("button");
    buttonGetArticle.id="ats-btn__article";
    buttonGetArticle.innerText="Артикулы";
    buttonGetArticle.style.height="30px";
    buttonGetArticle.style.border="none";
    buttonGetArticle.style.color="#ececec";
    buttonGetArticle.style.backgroundColor="#6bc7b5";
    buttonGetArticle.style.cursor="pointer";
    buttonGetArticle.style.fontSize="14px";
    divWrapper.append(buttonGetArticle);

    // Textarea
    let textarea = document.createElement("textarea");
    textarea.id="ats-textarea__article";
    textarea.style.height="70px";
    divWrapper.append(textarea);
    document.body.append(divWrapper);

    let article = [];
    let requestPromise = [];

    let regExp = {
        nope: /\.{3,}/,
        article: /<h1[^>]+itemprop\=\"name"[^>]+><a[^>]+[^>]+>([\s\S].+)<\/a><\/h1>/,
        title_name: /<a[^>]+id\=\"ctl00_b_ctl00_hlAbout"[^>]+[^"]+[\s\S]?([^"'].+)"<\/a>/
    };

    document.getElementById('ats-btn__article').addEventListener("click", function () {
        let partno = document.getElementsByClassName("partno");
        let textarea = document.getElementById("ats-textarea__article");
        let button = document.getElementById("ats-btn__article");

        partno = [].slice.call(partno);

        partno.map((item, index)=>{
            if (regExp.nope.test(item.textContent)) {
                let children = item.parentElement.parentElement.children;
                let valueHref = null;
                console.dir(item.textContent);

                Array.from(children).map((childItem)=>{
                    if (/descr/.test(childItem.className)) {
                        valueHref = childItem.href
                    }

                });
                requestPromise.push(httpGet(valueHref, index));
            } else {
                article.push({
                    id: index,
                    value: item.innerText,
                });
            }
        });

        if (requestPromise.length>0) {
            button.textContent="Загрузка...";
            button.style.backgroundColor="#916bc7";
        }


        Promise.all([...requestPromise]).then((responses)=>{

            responses.map((responseItem, responseIndex)=>{
                let {response, id} = responseItem;

                let responseData = response.match(regExp.article);
                responseData = responseData[1].replace(response.match(regExp.title_name)[1], "").replace(/[\s]?/,"");

                console.dir(responseData);

                article.push({
                    id: id,
                    value: responseData
                })

            });

            console.dir(responses);

        }).then(()=>{

            if (requestPromise.length>0) {
                button.textContent="Артиклы";
                button.style.backgroundColor="#6bc7b5";
            }

            article.sort((a, b)=>a.id-b.id);

            let articleData = "";
            button.textContent="Текс скопирован";

            setTimeout(()=>{
                button.textContent = "Артикулы";
            }, 3000);

            textarea.style.height=`${50+article.length*15}px`;

            article.map((item, index)=>{

                let value = item.value.replace(/[^a-zA-Z0-9]/g, "");
                if (index!==article.length-1) {
                    articleData += `${value}, `;
                } else {
                    articleData += `${value}`;
                }
            });

            textarea.textContent="";
            textarea.textContent=articleData;

            navigator.clipboard.writeText(articleData)
                .then(() => {
                })
                .catch(err => {
                    console.log('Something went wrong', err);
                });

            article=[];
            requestPromise=[]

        }).catch(()=>{
            button.textContent="Ошибка";
            button.style.backgroundColor="#c75e4d";
        });

    });


})();


function httpGet(url, id) {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (this.status === 200) {
                resolve({response:this.response, id: id});
            } else {
                let error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };
        xhr.send();
    });
}