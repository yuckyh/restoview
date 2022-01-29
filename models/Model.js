import db from '../db.js';
import { errorResponse, HTTPJSONError } from '../utils.js';

export default class Model {
  static table;
  constructor(obj) {
    this.setValues(obj);
  }

  setValues(obj) {
    Object.assign(this, obj);
  }

  parse() {}

  static arrResultCallback(res, onComplete) {
    const datas = [];

    return (err, result) => {
      if (err) return this.sqlErrorResponse(res, err);

      if (result) {
        datas.splice(0, datas.length);
        datas.push(...result);
      }

      const parsedDatas = datas.map((data) => {
        const jsonifiedData = this.jsonify(data);
        const parsedData = new this(jsonifiedData);
        parsedData.parse();
        return parsedData;
      });

      onComplete(parsedDatas);
    };
  }

  static resultCallback(data, res, onComplete) {
    return (err, result) => {
      if (err) return this.sqlErrorResponse(res, err);

      if (result) {
        if (result.affectedRows === 0)
          return errorResponse(res, 404, 'Operation failed');

        const id =
          result.insertId !== 0
            ? result.insertId
            : data.id
            ? data.id
            : undefined;
        data.setValues({ ...data, id });
      }

      if (result[0]) data.setValues(result[0]);

      const jsonifiedData = this.jsonify(data);
      const parsed = new this(jsonifiedData);
      parsed.parse();
      onComplete(parsed);
    };
  }

  static query(query, params, callback) {
    db.query(query, this.sqlifyParams(params), callback);
  }

  static jsonify(obj) {
    const jsonifiedObj = {};

    Object.entries(obj).forEach((entry) => {
      const [key, val] = entry;

      jsonifiedObj[this.snakeToCamel(key)] = val;
    });

    return jsonifiedObj;
  }

  static sqlErrorResponse(res, err) {
    if (err) {
      if (err.errno === 1062) {
        errorResponse(res, 400, 'There are duplicates in the data provided');
        return true;
      }

      errorResponse(res, 500, err);
      return true;
    }

    return false;
  }

  static camelToSnake(str) {
    return Array.from(str)
      .map((char) => {
        const charCode = char.charCodeAt(0);

        if (charCode > 65 && charCode < 90) {
          return '_' + String.fromCharCode(charCode + 32);
        }

        return char;
      })
      .join('');
  }

  static snakeToCamel(str) {
    let toUpper = false;
    return Array.from(str)
      .map((char) => {
        if (toUpper) {
          toUpper = false;
          return String.fromCharCode(char.charCodeAt(0) - 32);
        }
        if (char === '_') {
          toUpper = true;
          return '';
        }
        return char;
      })
      .join('');
  }

  static sqlify(obj) {
    const sqlifiedObj = {};

    Object.entries(obj).forEach((entry) => {
      const [key, val] = entry;

      sqlifiedObj[this.camelToSnake(key)] = val;
    });

    return sqlifiedObj;
  }

  static sqlifyParams(params) {
    return params.map((param) => {
      if (typeof param === 'object' && param.length === undefined) {
        return this.sqlify(param);
      }
      return param;
    });
  }
}
