module.exports = async (response) => (console.log((await response).body), response);
