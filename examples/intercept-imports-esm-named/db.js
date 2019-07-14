const data = {};

export async function get(k) {
  return data[k];
}

export async function set(k, v) {
  data[k] = v;
}
