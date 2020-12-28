const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let message = null;
let messageSent = new Date();
let askForNewMessage = new Date();

router.get('/subscribe', async (ctx, next) => {
  const newMessage = await new Promise( (resolve, reject) => {
    askForNewMessage = new Date();
    const interval = setInterval(() => {
        if (message && askForNewMessage < messageSent) {
          resolve(message);
          clearTimeout(interval);
        }
      },
      400
    );
    });
  ctx.response.statusCode = 200;
  ctx.body = newMessage;
});

router.post('/publish', async (ctx, next) => {
  message = ctx.request.body.message;
  messageSent = new Date();
  ctx.response.statusCode = 201;
  ctx.body = 'Message has been added';
});

app.use(router.routes());

module.exports = app;
