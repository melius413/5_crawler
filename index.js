#!/usr/bin/env node
// console.log('activated crawler module');
const fs = require('fs');


/**** csv 가져오기 ****/
// csv는 쉼표와 세미콜론 그리고 공백으로 구분한다.
const csv = require('csv-parse/lib/sync');
const file = fs.readFileSync('./excel/movie.csv'); // file은 Buffer
// console.log(file.toString('utf-8'));
const rs = csv(file.toString('utf-8')); // 2차 배열화 시켜줌, rs 레코드 셋
//// console.log(rs);


/**** xlsx 가져오기 ****/
const xlsx = require('xlsx');
const file_xlsx = xlsx.readFileSync('./excel/movie.xlsx');
const sheet = file_xlsx.Sheets.movie; // 시트들 중에 이름이 movie인 시트를 가져옴
const rs_xlsx = xlsx.utils.sheet_to_json(sheet); // 객체 배열로 만들어줌
//// console.log(rs_xlsx);


/**** axios, cheerio로 크롤링 하기 ****/
// axios는 userAgent가 axios 뜬다.
// 봇이라는 것을 숨길 수 없다. 차단당할 수 있음
const axios = require('axios'); // 프로미스 모델
const cheerio = require('cheerio');
const crawler = async () => {
    let result, $, text, summary = [];
    for (let v of rs_xlsx) {
        result = await axios.get(v.link);
        // console.log(result.data);
        $ = cheerio.load(result.data);
        text = $('.story_area .con_tx').text();
        // console.log(text);
        summary.push(text);
    }
    console.log(summary);
}
//// crawler();


/**** puppeteer로 크롤링 하기 ****/
// 브라우저를 직접 띄워 콘트롤한다.
// 봇이라는 것을 숨길 수 있다.
const puppeteer = require('puppeteer');
// const stringfy = require('csv-stringify'); // method 1
const stringifySync = require('csv-stringify/lib/sync'); // method 2
const crawler_p = async () => {
    const browser = await puppeteer.launch({ headless: false }); // true면 브라우저를 안 띄운다.
    const page = await browser.newPage();
    // 서버는 항상 userAgent를 읽는다. 기본적으로 userAgent는 puppeteer라고 되어 있음
    // 사용자가 직접 접속하는 것 처럼 할려면 userAgent 설정필요 (navigator.userAgent에서 확인)
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36");

    /*
    await page.goto(rs_xlsx[0].link);
    await page.waitFor(2000); // 2초 대기
    await page.goto(rs_xlsx[1].link);
    await page.waitFor(3000); // 2초 대기
    */

    let summary = [], el, text;
    console.log('rs_xlsx:', rs_xlsx);
    for (let v of rs_xlsx) {
        let rand = Math.random() * 1000 + 1000;
        await page.goto(v.link);
        el = await page.$('.story_area .con_tx');
        console.log(el);
        if (el) {
            text = await page.evaluate(tag => tag.textContent, el); // textContent는 html 속성
            summary.push([v.num, v.title, v.link, text]); // for CSV
        }
        await page.waitFor(rand);
    }
    console.log(summary);
    await page.close();
    await browser.close();
    // const str = JSON.stringfy(summary);

    /*
    // method 1 for CSV
    stringfy(summary, (err, str) => {
        console.log(str);
        fs.writeFileSync('./excel/result.csv', str);
    });
    */

    // method 2 for CSV
    const str = stringifySync(summary);
    console.log(str);
    fs.writeFileSync('./excel/result.csv', str);
}

// crawler_p();

////////////
// save at excel
const add_to_sheet = require('./add_to_sheet');
const crawler_p2 = async () => {
    let summary = [], el, text, cell;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36");

    for (let [k, v] of rs_xlsx.entries()) { // es6, entries() 키와 값을 다 순회
        let rand = Math.random() * 1000 + 1000;
        await page.goto(v.link);
        el = await page.$('.story_area .con_tx');
        if (el) {
            text = await page.evaluate(tag => tag.textContent, el); // textContent는 html 속성
            cell = 'D' + (k + 2);
            add_to_sheet(sheet, cell, 's', text.trim());
        }
        await page.waitFor(rand);
    }
    console.log(summary);
    await page.close();
    await browser.close();

    xlsx.writeFile(file_xlsx, './excel/result.xlsx');
}

crawler_p2();