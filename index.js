require('dotenv').config();

const axios = require('axios').default;
const Nexmo = require('nexmo');
const bot = require('./discord');

const {
  NEXMO_API_KEY,
  NEXMO_API_SECRET,
  SMS_RECIPIENT
} = process.env;

const nexmo = new Nexmo({
  apiKey: NEXMO_API_KEY,
  apiSecret: NEXMO_API_SECRET
});

function sendSMS (store, item) {
  const from = 'N. Switch Reminder';
  const to = SMS_RECIPIENT;
  const text = `${item} in-stock at ${store}`;

  nexmo.message.sendSms(from, to, text);
}

function logInStock (store, item) {
  console.log(`INSTOCK: ${store}: ${item}`);
}

function logOutOfStock (store, item) {
  bot.on('ready', () => {
    bot.channels
      .fetch('712312904782708736')
      .then(channel => {
        channel.send(`OUTOFSTOCK: ${store}: ${item}`)
          .then(msg => {
            console.log(`OUTOFSTOCK: ${store}: ${item}`);
          })
          .catch(err => {
            console.error(err.message);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
  console.log(`OUTOFSTOCK: ${store}: ${item}`);
}

function logError (err, store, item) {
  console.error(`ERROR: ${store}: ${item}: ${err.message}`);
}

function checkStore ({ url, searchTag, store, item }) {
  axios.get(url)
    .then((resp) => {
      if (resp.status !== 200) {
        throw new Error('Status not 200');
      }

      const html = resp.data.replace(/(\r\n|\n|\r)/gm, '')
        .replace(/>[\s]+</g, '><')
        .replace(/[\s]+/g, ' ');

      if (!html.includes(searchTag)) {
        logOutOfStock(store, item);
        return;
      }

      sendSMS(store, item);
      logInStock(store, item);
    })
    .catch((err) => {
      logError(err, store, item);
    });
}
checkStore({
  url: 'https://ecommerce.datablitz.com.ph/collections/nintendo-switch-console/products/nintendo-switch-console-gray',
  searchTag: '<button type="submit" class="product-form__add-button button button--primary" data-action="add-to-cart">Add to cart</button>',
  store: 'Datablitz',
  item: 'Nintendo Switch Console Grey'
});

checkStore({
  url: 'https://ecommerce.datablitz.com.ph/collections/nintendo-switch-console/products/nintendo-switch-console-neon-red-blue-refresh',
  searchTag: '<button type="submit" class="product-form__add-button button button--primary" data-action="add-to-cart">Add to cart</button>',
  store: 'Datablitz',
  item: 'Nintendo Switch Console Neon'
});

checkStore({
  url: 'http://gameone.ph/nintendo/nintendo-hardware/nintendo-switch-joy-con-gray-v2-with-labo-robot-kit.html',
  searchTag: '<button type="submit" title="Add to Cart" class="action primary tocart" id="product-addtocart-button"><span>Add to Cart</span></button>',
  store: 'Game One',
  item: 'Nintendo Switch Console Grey'
});

checkStore({
  url: 'http://gameone.ph/nintendo/nintendo-hardware/nintendo-switch-neon-joy-con-v2-with-labo-robot-kit-bundle.html',
  searchTag: '<button type="submit" title="Add to Cart" class="action primary tocart" id="product-addtocart-button"><span>Add to Cart</span></button>',
  store: 'Game One',
  item: 'Nintendo Switch Console Neon'
});

checkStore({
  url: 'https://gameline.ph/collections/switch-console/products/nintendo-switch-v1-unit-pokemon-lets-go-pikachu-bundle-mde?variant=31737759465521',
  searchTag: '<link itemprop="availability" href="http://schema.org/InStock">',
  store: 'Gameline',
  item: 'Nintendo Switch Console Pokemon Pikachu'
});

checkStore({
  url: 'https://gameline.ph/collections/switch-console/products/nintendo-switch-v1-unit-pokemon-eevee-pikachu-bundle-mde?variant=31737759531057',
  searchTag: '<link itemprop="availability" href="http://schema.org/InStock">',
  store: 'Gameline',
  item: 'Nintendo Switch Console Pokemon Eevee'
});

console.log(new Date());
