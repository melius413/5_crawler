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
const puppeteer = require('puppeteer');
const crawler_p = async () => {
    const browser = await puppeteer.launch({ headless: false }); // true면 브라우저를 안 띄운다.
    const page = await browser.newPage();
    await page.goto(rs_xlsx[0].link);
    await page.waitFor(2000); // 2초 대기
    await page.goto(rs_xlsx[1].link);
    await page.waitFor(3000); // 2초 대기
    await page.close();
    await browser.close();
}

crawler_p();