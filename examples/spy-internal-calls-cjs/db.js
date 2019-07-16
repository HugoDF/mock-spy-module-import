const data = {};

async function get(k) {
  return data[k];
}

async function set(k, v) {
  data[k] = v;
}

module.exports = {
  get,
  set
};
