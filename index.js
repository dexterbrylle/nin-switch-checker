require('dotenv').config();

const axios = require('axios').default;
const Nexmo = require('nexmo');
const Discord = require('discord.js');
const bot = new Discord.Client();

const {
  NEXMO_API_KEY,
  NEXMO_API_SECRET,
  SMS_RECIPIENT,
  DISCORD_BOT_TOKEN
} = process.env;

bot.login(DISCORD_BOT_TOKEN);

const nexmo = new Nexmo({
  apiKey: NEXMO_API_KEY,
  apiSecret: NEXMO_API_SECRET
});

function sendSMS (store, item, price) {
  const from = 'N. Switch Reminder';
  const to = SMS_RECIPIENT;
  const text = `${item} in-stock at ${store} - P${price}`;

  nexmo.message.sendSms(from, to, text);
}

function botNoStockMessage (store, item) {
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
}

function botInStockMessage (store, item, price) {
  bot.on('ready', () => {
    bot.channels
      .fetch('712312904782708736')
      .then(channel => {
        channel.send(`INSTOCK: ${store}: ${item} - P${price}`)
          .then(msg => {
            console.log(`INSTOCK: ${store}: ${item} - P${price}`);
          })
          .catch(err => {
            console.error(err.message);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
}

function logInStock (store, item, price) {
  botInStockMessage(store, item, price);
}

function logOutOfStock (store, item, price) {
  console.log(`OUTOFSTOCK: ${store}: ${item} - P${price}`);
}

function logError (err, store, item) {
  console.error(`ERROR: ${store}: ${item}: ${err.message}`);
}

function checkStore ({ url, searchTag, store, item, itemPrice }) {
  axios.get(url)
    .then((resp) => {
      if (resp.status !== 200) {
        throw new Error('Status not 200');
      }

      const html = resp.data.replace(/(\r\n|\n|\r)/gm, '')
        .replace(/>[\s]+</g, '><')
        .replace(/[\s]+/g, ' ');

      let price = itemPrice.toString().replace((/((\D+\W))/g), '');
      if (price.length > 9) {
        price = price.slice(-9);
      }

      if (!html.includes(searchTag)) {
        logOutOfStock(store, item, price);
        return;
      }
      logInStock(store, item, price);
      if (store === 'Datablitz' || store === 'Gameline') {
        sendSMS(store, item, price);
      }
    })
    .catch((err) => {
      logError(err, store, item);
    });
}

checkStore({
  url: 'https://ecommerce.datablitz.com.ph/collections/nintendo-switch-console/products/nintendo-switch-console-gray',
  searchTag: '<button type="submit" class="product-form__add-button button button--primary" data-action="add-to-cart">Add to cart</button>',
  store: 'Datablitz',
  item: 'Nintendo Switch Console Grey',
  itemPrice: '<span class="price">₱18,995</span>'
});

checkStore({
  url: 'https://ecommerce.datablitz.com.ph/collections/nintendo-switch-console/products/nintendo-switch-console-neon-red-blue-refresh',
  searchTag: '<button type="submit" class="product-form__add-button button button--primary" data-action="add-to-cart">Add to cart</button>',
  store: 'Datablitz',
  item: 'Nintendo Switch Console Neon',
  itemPrice: '<span class="price">₱18,995</span>'
});

checkStore({
  url: 'http://gameone.ph/nintendo/nintendo-hardware/nintendo-switch-joy-con-gray-v2-with-labo-robot-kit.html',
  searchTag: '<button type="submit" title="Add to Cart" class="action primary tocart" id="product-addtocart-button"><span>Add to Cart</span></button>',
  store: 'Game One',
  item: 'Nintendo Switch Console Grey',
  itemPrice: '<span class="price">₱24,995.00</span>'
});

checkStore({
  url: 'http://gameone.ph/nintendo/nintendo-hardware/nintendo-switch-neon-joy-con-v2-with-labo-robot-kit-bundle.html',
  searchTag: '<button type="submit" title="Add to Cart" class="action primary tocart" id="product-addtocart-button"><span>Add to Cart</span></button>',
  store: 'Game One',
  item: 'Nintendo Switch Console Neon',
  itemPrice: '<span class="price">₱24,995.00</span>'
});

checkStore({
  url: 'https://gameline.ph/collections/switch-console/products/nintendo-switch-v1-unit-pokemon-lets-go-pikachu-bundle-mde?variant=31737759465521',
  searchTag: '<link itemprop="availability" href="http://schema.org/InStock">',
  store: 'Gameline',
  item: 'Nintendo Switch Console Pokemon Pikachu',
  itemPrice: '<span class="visually-hidden">₱20,995.00</span>'
});

checkStore({
  url: 'https://gameline.ph/collections/switch-console/products/nintendo-switch-v1-unit-pokemon-eevee-pikachu-bundle-mde?variant=31737759531057',
  searchTag: '<link itemprop="availability" href="http://schema.org/InStock">',
  store: 'Gameline',
  item: 'Nintendo Switch Console Pokemon Eevee',
  itemPrice: '<span class="visually-hidden">₱20,995.00</span>'
});

checkStore({
  url: 'https://ecommerce.datablitz.com.ph/collections/nintendo-switch-console/products/nintendo-switch-console-animal-crossing-new-horizons-edition',
  searchTag: '<button type="submit" class="product-form__add-button button button--primary" data-action="add-to-cart">Add to cart</button>',
  store: 'Datablitz',
  item: 'Nintendo Switch Console ACNH',
  itemPrice: '<span class="price">₱19,495</span>'
});

checkStore({
  url: 'https://www.lazada.com.ph/products/nintendo-switch-unit-version-2-gray-console-with-super-smash-bros-ultimate-bundle-i719188137-s2097942405.html',
  searchTag: '"availability":"https://schema.org/InStock"',
  store: 'Toy Kingdom',
  item: 'Switch Console Grey',
  itemPrice: '<span class=" pdp-price pdp-price_type_normal pdp-price_color_orange pdp-price_size_xl" data-spm-anchor-id="a2o4l.pdp.0.i2.b1e02d6b9ezFvF">₱23,999.75</span>'
});

checkStore({
  url: 'https://www.lazada.com.ph/products/nintendo-switch-unit-version-2-neon-blue-and-neon-red-with-smash-bros-ultimate-bundle-i719244263-s2097998997.html',
  searchTag: '"availability":"https://schema.org/InStock"',
  store: 'Toy Kingdom',
  item: 'Nintendo Switch Console Neon',
  itemPrice: '<span class=" pdp-price pdp-price_type_normal pdp-price_color_orange pdp-price_size_xl" data-spm-anchor-id="a2o4l.pdp.0.i0.5fbc5693UrvjeC">₱23,999.75</span>'
});

checkStore({
  url: 'https://www.lazada.com.ph/products/nintendo-switch-animal-crossing-new-horizons-edition-with-just-dance-2020-bundle-i719222678-s2098126745.html',
  searchTag: '"availability":"https://schema.org/InStock"',
  store: 'Toy Kingdom',
  item: 'Nintendo Switch Console ACNH',
  itemPrice: '<span class=" pdp-price pdp-price_type_normal pdp-price_color_orange pdp-price_size_xl" data-spm-anchor-id="a2o4l.pdp.0.i0.32bda44dx4glFr">₱23,999.75</span>'
});

console.log(new Date());
