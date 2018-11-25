// 关系型数据模型基类
// by YuRonghui 2018-11-25
const { Query } = require('wood-query')();
const { Mysql } = require('wood-mysql')();
const { Util } = require('wood-util')();
const { error, catchErr } = WOOD;

class Model {
  constructor(opts = {}) {
    this.tableName = opts.tableName || '';
    this.fields = opts.fields || {};
    this.primarykey = opts.primarykey || 'id'; //默认主键名
    this.query = Querysql(this.tableName);
  }

  // 设置getter和setter
  _get_set() {
    let obj = {}, fieldMap = this.fields.fieldMap;
    for (let key in fieldMap) {
      obj[key] = {
        get() {
          return fieldMap[key].value || fieldMap[key].defaultValue;
        },
        set(val) {
          fieldMap[key].value = val;
        }
      }
    }
    return obj;
  }

  _init() {
    return Object.create(this, this._get_set());
  }

  // 重置数据
  resetData() {
    this.fields.resetData();
  }

  // 设置数据
  setData(target, value) {
    this.fields.setData(target, value);
  }

  // 获取模型数据
  getData(hasVirtualField = true) {
    return this.fields.getData(hasVirtualField);
  }

  // 是否新的
  isNew() {
    return !this.getData()[this.primarykey];
  }

  //新增数据
  async create(data = {}, hascheck = true) {
    if (!data) throw error('create方法的参数data不能为空');
    if(!Util.isEmpty(data)) this.setData(data);
    let err = hascheck ? this.fields.validate() : false;
    if (err) throw error(err);
    let sql = this.query.where({ id }).create(this.getData());
    let result = await catchErr(this.db.execute(sql));
    if(result.err) throw error(result.err);
    return result.data;
  }

  // 更新数据
  async update(data = {}, hascheck = true) {
    if (!data) throw error('update方法的参数data不能为空');
    if(!Util.isEmpty(data)) this.setData(data);
    if (!this.isNew()) {
      let err = hascheck ? this.fields.validate() : false,
        id = data[this.primarykey];
      if (err) {
        throw error(err);
      } else {
        delete data[this.primarykey];
        let keys = Object.keys(data),
          idObj = {};
        idObj[this.primarykey] = id;
        let sql = this.query.where({ id }).update(data);
        const result = await catchErr(this.db.execute(sql));
        if (result.data){
          return idObj;
        }else{
          throw error(result.err);
        }
      }
    }
    throw error(false);
  }

  // 保存数据
  async save() {
    let data = this.getData(false);
    if (Util.isEmpty(data) || !data) throw error('save方法的data为空');
    if (!this.isNew()) {
      const updateOk = await catchErr(this.update());
      if (updateOk.err) throw error(updateOk.err);
      return updateOk.data;
    } else {
      const result = await catchErr(this.create());
      if (result.err) throw error(result.err);
      return result.data;
    }
  }

  //删除数据
  async remove(data) {
    if (!data) return false;
    let sql = this.SQL.delete(data);
    return await this.db.execute(sql);
  }

  //清空数据
  async clear() {
    return this.db.drop();
  }

  // 查询单条记录
  async findOne(data) {

  }

  // 查询数据列表
  async findList(data) {

  }
}

module.exports = Model;
