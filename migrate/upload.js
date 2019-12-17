#!/usr/bin/env node

/* eslint no-console: "off" */

const Redis = require('ioredis');
const fs = require('fs');
const {
  argv
} = require('yargs')
  .default('h', '127.0.0.1')
  .default('p', 6379)
  .default('d', 0)
  .default('filename', 'dump.json');

const host = argv.h;
const port = argv.p;
const {
  filename
} = argv;


const redis = new Redis({
  host,
  port,
  db: 0});


const dumpFile = fs.readFileSync(filename);
const data = JSON.parse(dumpFile);

const executeParsing = () => {
  try{
    for (let chunk of data) {
      for (let key of Object.keys(chunk)) {
        switch(chunk[key].type){
          case 'hash':
            redis.hmset(key, {...chunk[key].value});
            break;
          case 'set':
            redis.sadd(key, [...chunk[key].value]);
            break;
          case 'list':
            redis.lpush(key, [...chunk[key].value]);
            break;
          case 'string':
            redis.set(key, chunk[key].value);
            break;
          default:
            break;
        }
      }
    }
    console.log(`Number of keys added: ${res.length}`);
  } catch(err){
    console.log('An error occured', err);
  } finally {
    const executionTimeMs = new Date() - startTime;
    const executionTimeStr = millisecondsToStr(executionTimeMs);
    console.info(`\nExecution time: ${executionTimeStr}`);
  }
}

function millisecondsToStr(milliseconds) {
  function numberEnding(number) {
    return (number > 1) ? 's' : '';
  }

  let temp = Math.floor(milliseconds / 1000);

  const hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return `${hours} hour${numberEnding(hours)}`;
  }
  const minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return `${minutes} minute${numberEnding(minutes)}`;
  }
  const seconds = temp % 60;
  if (seconds) {
    return `${seconds} second${numberEnding(seconds)}`;
  }
  return 'Less than a second';
}


executeParsing();