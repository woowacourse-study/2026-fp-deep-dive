/* utils - All [C] */
function getValueByKey(object, key) {
  return object[key];
}

function getValueByKeys(object, ...keys) {
  const keyPath = Array.isArray(keys[0]) ? keys[0] : keys;

  let value = object;
  for (let i = 0; i < keyPath.length; i++) {
    value = value[keyPath[i]];
  }

  return value;
}

function getUpdateAmountAtKey(originalObject, key, amount) {
  const newObject = { ...originalObject };
  newObject[key] += amount;
  return newObject;
}

function getUpdateValueAtKey(originalObject, key, value) {
  const newObject = { ...originalObject };
  newObject[key] = value;
  return newObject;
}

function addElemToArray(array, elem) {
  const newArray = [...array];
  newArray.push(elem);
  return newArray;
}

function findById(array, id) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return array[i];
    }
  }
  return null;
}

function replaceById(array, id, newItem) {
  const newArray = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      newArray.push(newItem);
    } else {
      newArray.push(array[i]);
    }
  }

  return newArray;
}

function filterByKey(array, key, targetValue) {
  let resultArray = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === targetValue) {
      resultArray.push(array[i]);
    }
  }
  return resultArray;
}

function calculatePercentage(amount, rate) {
  return Math.floor((amount * rate) / 100);
}

function checkValueExist(value, msg) {
  if (!value) {
    console.log(msg);
    return null;
  }
}

module.exports = {
  getValueByKey,
  getValueByKeys,
  getUpdateAmountAtKey,
  getUpdateValueAtKey,
  addElemToArray,
  findById,
  replaceById,
  filterByKey,
  calculatePercentage,
  checkValueExist,
};
