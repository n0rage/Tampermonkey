// ==UserScript==
// @name         leparisien.fr
// @namespace    http://www.leparisien.fr/
// @version      0.2
// @description  Permet de lire les articles "abonnés" du site leparisien.fr
// @author       @no__rage
// @match        http://www.leparisien.fr/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.content').forEach(node => node.removeAttribute('style'))
        document.querySelector('.piano-paywall').remove()
    })
})();
