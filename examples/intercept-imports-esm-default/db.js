const data = {};

async function get(k) {
  return data[k];
}

async function set(k, v) {
  data[k] = v;
}

const db = {
  get,
  set
};

export default db;
